"""OAuth router - Google and GitHub login."""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.cookies import set_auth_cookie
from app.core.dependencies import get_db
from app.core.oauth import oauth
from app.modules.users import user_crud
from app.modules.users.models import User

router = APIRouter()


@router.get("/login/{provider}")
async def oauth_login(request: Request, provider: str):
    """
    Redirect to OAuth provider (google or github)
    """
    # Validate provider
    if provider not in ["google", "github"]:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

    # Check if OAuth client is configured
    client = oauth.create_client(provider)
    if client is None:
        raise HTTPException(
            status_code=500,
            detail=f"OAuth provider '{provider}' is not configured. Please check your environment variables.",
        )

    # Callback must point to backend so Authlib can handle the state/code exchange
    redirect_uri = (
        f"{settings.BACKEND_URL}{settings.API_V1_STR}/auth/login/{provider}/callback"
    )

    try:
        return await client.authorize_redirect(request, redirect_uri, prompt="consent")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to initiate OAuth flow: {str(e)}"
        )


@router.get("/login/{provider}/callback")
async def oauth_callback(
    request: Request, provider: str, db: Session = Depends(get_db)
) -> Any:
    """
    Handle OAuth callback, create/retrieve user, and redirect to frontend with token
    """
    client = oauth.create_client(provider)
    try:
        token = await client.authorize_access_token(request)
    except Exception as e:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error=oauth_failed&details={str(e)}"
        )

    # Fetch user info based on provider
    user_info = None
    email = None
    full_name = None
    provider_id = None

    if provider == "google":
        # Get user info from token
        user_info = token.get("userinfo")
        if not user_info:
            user_info = await client.parse_id_token(request, token)

        # Validate issuer for security
        iss = user_info.get("iss")
        if iss not in ["https://accounts.google.com", "accounts.google.com"]:
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=invalid_issuer"
            )

        email = user_info.get("email")
        full_name = user_info.get("name")
        provider_id = user_info.get("sub")

    elif provider == "github":
        resp = await client.get("https://api.github.com/user", token=token)
        if resp.status_code != 200:
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=github_api_error"
            )

        profile = resp.json()
        email = profile.get("email")
        full_name = profile.get("name")
        provider_id = str(
            profile.get("id")
        )  # Use durable ID as per GitHub best practices

        # Revalidate user identity as recommended by GitHub
        # This ensures we're getting the current user and not cached data
        user_validation_resp = await client.get(
            "https://api.github.com/user", token=token
        )
        if (
            user_validation_resp.status_code == 200
            and str(user_validation_resp.json().get("id")) != provider_id
        ):
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=user_identity_mismatch"
            )

        # GitHub doesn't always provide email in the user profile
        # Need to fetch from the user/emails endpoint
        if not email:
            emails_resp = await client.get(
                "https://api.github.com/user/emails", token=token
            )
            if emails_resp.status_code == 200:
                emails = emails_resp.json()
                for e in emails:
                    # Get primary and verified email as per GitHub recommendations
                    if e.get("primary") and e.get("verified"):
                        email = e.get("email")
                        break

            # If still no email, try to get any verified email
            if not email and emails_resp.status_code == 200:
                emails = emails_resp.json()
                for e in emails:
                    if e.get("verified"):
                        email = e.get("email")
                        break

        # Validate that we got essential user information
        if not provider_id:
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=missing_github_id"
            )

    # Validate required fields
    if not email or not provider_id:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error=missing_user_info"
        )

    # Check if user exists by email
    user = user_crud.get_by_email(db, email=email)
    if not user:
        # Check if user with this provider_id already exists (prevents duplicate accounts)
        existing_user = (
            db.query(User)
            .filter(User.provider == provider, User.provider_id == provider_id)
            .first()
        )

        if existing_user:
            # User changed their email on GitHub/Google but same account
            existing_user.email = email
            existing_user.full_name = full_name or existing_user.full_name
            db.commit()
            user = existing_user
        else:
            # Create new user with OAuth info
            user = User(
                email=email,
                full_name=full_name or email.split("@")[0],  # Fallback name
                hashed_password="",  # OAuth users don't have passwords
                provider=provider,
                provider_id=provider_id,
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        # User exists - validate and update provider info if needed
        if user.provider and user.provider != provider:
            # User is trying to login with different OAuth provider
            # This could be account linking or a security issue
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=account_already_exists&provider={user.provider}"
            )
        elif not user.provider:
            # Link OAuth account to existing email/password account
            user.provider = provider
            user.provider_id = provider_id
            db.commit()
        elif user.provider_id != provider_id:
            # Same provider but different provider_id - suspicious
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=provider_id_mismatch"
            )
        else:
            # Update user info in case it changed on the OAuth provider
            user.full_name = full_name or user.full_name
            user.is_active = True  # Reactivate if was deactivated
            db.commit()

    # Generate JWT with proper expiration
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Create response with secure cookie
    response = RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    )

    # Set secure HTTP-only cookie
    set_auth_cookie(
        response,
        token=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return response
