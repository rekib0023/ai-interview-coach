from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.oauth import oauth

router = APIRouter()


@router.get("/login/{provider}")
async def oauth_login(request: Request, provider: str):
    """
    Redirect to OAuth provider (google or github)
    """
    # Callback must point to backend so Authlib can handle the state/code exchange
    redirect_uri = (
        f"{settings.BACKEND_URL}{settings.API_V1_STR}/auth/login/{provider}/callback"
    )
    return await oauth.create_client(provider).authorize_redirect(
        request, redirect_uri, prompt="consent"
    )


@router.get("/login/{provider}/callback")
async def oauth_callback(
    request: Request, provider: str, db: Session = Depends(deps.get_db)
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
    if provider == "google":
        user_info = token.get("userinfo")
        if not user_info:
            user_info = await client.parse_id_token(request, token)
        email = user_info.get("email")
        full_name = user_info.get("name")
        provider_id = user_info.get("sub")

    elif provider == "github":
        resp = await client.get("user", token=token)
        profile = resp.json()
        email = profile.get("email")
        full_name = profile.get("name")
        provider_id = str(profile.get("id"))

        if not email:
            resp = await client.get("user/emails", token=token)
            emails = resp.json()
            for e in emails:
                if e.get("primary") and e.get("verified"):
                    email = e.get("email")
                    break

    if not email:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error=email_not_found"
        )

    # Check if user exists
    user = crud.user.get_user_by_email(db, email=email)
    if not user:
        # Create new user
        from app.models.user import User

        user = User(
            email=email,
            full_name=full_name,
            hashed_password="",  # Empty string or None
            provider=provider,
            provider_id=provider_id,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update provider info if linking
        if not user.provider:
            user.provider = provider
            user.provider_id = provider_id
            db.commit()

    # Generate JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )

    # Redirect to frontend with token
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    )
