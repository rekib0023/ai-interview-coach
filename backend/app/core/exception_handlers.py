"""Centralized exception handlers for domain exceptions.

This module provides FastAPI exception handlers that translate domain exceptions
(NotFoundError, ValidationError, BusinessLogicError) into appropriate HTTP responses.
"""

import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.shared.exceptions import (
    AppException,
    BusinessLogicError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)

logger = logging.getLogger(__name__)


async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    """Handle NotFoundError exceptions by returning 404 responses."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


async def validation_error_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    """Handle ValidationError exceptions by returning 400 responses."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


async def business_logic_error_handler(
    request: Request, exc: BusinessLogicError
) -> JSONResponse:
    """Handle BusinessLogicError exceptions by returning 422 responses."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )


async def exception_handler(request: Request, exc: Exception):
    """Handle application exceptions."""
    if isinstance(exc, NotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.message, "details": exc.details},
        )

    if isinstance(exc, ValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.message, "details": exc.details},
        )

    if isinstance(exc, UnauthorizedError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": exc.message, "details": exc.details},
        )

    if isinstance(exc, BusinessLogicError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message, "details": exc.details},
        )

    if isinstance(exc, AppException):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": exc.message, "details": exc.details},
        )

    # Log unexpected exceptions
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
