"""Auth module exports."""

from app.modules.auth.oauth_router import router as oauth_router
from app.modules.auth.router import router as auth_router

__all__ = [
    "auth_router",
    "oauth_router",
]
