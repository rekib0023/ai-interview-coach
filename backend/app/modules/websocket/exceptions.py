class ChatSessionError(Exception):
    """Base exception for chat session errors."""

    pass


class AuthenticationError(ChatSessionError):
    """Authentication related errors."""

    pass


class AssessmentAccessError(ChatSessionError):
    """Assessment access related errors."""

    pass
