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

from .service import AuthService, get_auth_service

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
    request: Request,
    provider: str,
    db: Session = Depends(get_db),
    auth_service: "AuthService" = Depends(get_auth_service),
) -> Any:
    """
    Handle OAuth callback, create/retrieve user, and redirect to frontend with token.
    Delegates all business logic to AuthService.
    """
    client = oauth.create_client(provider)
    try:
        token = await client.authorize_access_token(request)
    except Exception as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error=oauth_failed&details={str(e)}"
        )

    # Extract user info based on provider - delegated to service
    try:
        if provider == "google":
            user_info = token.get("userinfo")
            if not user_info:
                user_info = await client.parse_id_token(request, token)

            email, full_name, provider_id = auth_service.extract_google_user_info(
                user_info
            )

        elif provider == "github":
            resp = await client.get("https://api.github.com/user", token=token)
            if resp.status_code != 200:
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/signin?error=github_api_error"
                )

            profile = resp.json()
            email, full_name, provider_id = await auth_service.extract_github_user_info(
                client, token, profile
            )
        else:
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/signin?error=unsupported_provider"
            )

    except ValueError as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error={str(e).replace(' ', '_')}"
        )

    # Validate required fields
    if not email or not provider_id:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error=missing_user_info"
        )

    # Get or create user - delegated to service
    try:
        user = auth_service.get_or_create_oauth_user(
            db,
            email=email,
            full_name=full_name,
            provider=provider,
            provider_id=provider_id,
        )
    except HTTPException as e:
        # Handle account conflicts
        error_detail = str(e.detail).replace(" ", "_").replace(":", "")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/signin?error={error_detail}"
        )

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
