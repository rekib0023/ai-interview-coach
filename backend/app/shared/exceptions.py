"""Custom exceptions for the application."""


class AppException(Exception):
    """Base exception for all application exceptions."""

    def __init__(self, message: str, details: dict | None = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AppException):
    """Raised when a resource is not found."""

    pass


class ValidationError(AppException):
    """Raised when validation fails."""

    pass


class UnauthorizedError(AppException):
    """Raised when user is not authorized."""

    pass


class BusinessLogicError(AppException):
    """Raised when business logic validation fails."""

    pass


class ChatSessionError(Exception):
    """Base exception for chat session errors."""

    pass


class AuthenticationError(ChatSessionError):
    """Authentication related errors."""

    pass


class AssessmentAccessError(ChatSessionError):
    """Assessment access related errors."""

    pass
