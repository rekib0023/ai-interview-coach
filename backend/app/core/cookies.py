from fastapi import Response

from app.core.config import settings

# Use secure cookies only in production so http://localhost works in development
SECURE_AUTH_COOKIE = settings.ENVIRONMENT == "production"
AUTH_COOKIE_NAME = "access_token"


def set_auth_cookie(response: Response, token: str, max_age: int) -> None:
    """Set the auth cookie on a response.

    The backend reads this cookie in get_current_user, and it is set by both
    username/password login and OAuth flows.
    """
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=SECURE_AUTH_COOKIE,
        samesite="strict",
        max_age=max_age,
    )


def clear_auth_cookie(response: Response) -> None:
    """Clear the auth cookie on a response."""
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value="",
        httponly=True,
        secure=SECURE_AUTH_COOKIE,
        samesite="strict",
        max_age=0,
    )
