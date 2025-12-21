"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.core.exception_handlers import exception_handler
from app.modules.router import api_router
from app.shared.exceptions import AppException

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="AI Interview Coach API - Practice and improve your interview skills",
    version="1.0.0",
)

# Set all CORS enabled origins
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.ALLOWED_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Register exception handlers
app.add_exception_handler(AppException, exception_handler)


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Welcome to AI Interview Coach API"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
