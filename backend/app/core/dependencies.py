"""
Common dependencies for API endpoints with improved patterns and type safety.
"""

from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Generator, Optional

from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal

# ============================================================================
# Database Dependencies
# ============================================================================


def get_db() -> Generator[Session, None, None]:
    """
    Get database session dependency.

    Yields:
        Session: SQLAlchemy database session

    Note:
        This is a generator function, not async context manager.
        FastAPI's Depends() expects a callable that returns a generator.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@asynccontextmanager
async def get_db_session() -> Session:
    """
    Get database session for non-dependency usage (e.g., WebSocket, background tasks).

    Returns:
        Session: SQLAlchemy database session

    Warning:
        Caller is responsible for closing the session!

    Usage:
        db = get_db_session()
        try:
            # use db
        finally:
            db.close()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# Authentication Dependencies
# ============================================================================


def get_current_user(
    db: Session = Depends(get_db),
    access_token: Optional[str] = Cookie(None, alias="access_token"),
):
    """
    Get current authenticated user from JWT token in cookie.

    Args:
        db: Database session
        access_token: JWT access token from cookie

    Returns:
        User: Authenticated user object

    Raises:
        HTTPException: If authentication fails
    """
    from app.modules.users.models import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        # Log the error for debugging
        import logging

        logging.warning(f"JWT decode error: {e}")
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    # Optional: Check if user is active/enabled
    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled"
        )

    return user


def get_current_active_user(
    current_user=Depends(get_current_user),
):
    """
    Get current active user (optional additional check).

    Args:
        current_user: User from get_current_user dependency

    Returns:
        User: Active user object

    Raises:
        HTTPException: If user is inactive
    """
    if hasattr(current_user, "is_active") and not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled"
        )
    return current_user


def get_optional_user(
    db: Session = Depends(get_db),
    access_token: Optional[str] = Cookie(None, alias="access_token"),
):
    """
    Get current user if authenticated, None otherwise.

    Useful for endpoints that work differently for authenticated vs anonymous users.

    Args:
        db: Database session
        access_token: JWT access token from cookie

    Returns:
        Optional[User]: User object or None
    """
    from app.modules.users.models import User

    if not access_token:
        return None

    try:
        payload = jwt.decode(
            access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        user = db.query(User).filter(User.id == int(user_id)).first()
        return user
    except JWTError:
        return None


# ============================================================================
# Service Dependencies
# ============================================================================

# Note: Using lru_cache for singleton pattern is fine for stateless services,
# but be careful if services hold state or connections.


@lru_cache()
def get_user_service():
    """Get user service singleton."""
    from app.modules.users.service import UserService

    return UserService()


@lru_cache()
def get_assessment_service():
    """Get assessment service singleton."""
    from app.modules.assessments.service import AssessmentService

    return AssessmentService()


@lru_cache()
def get_code_execution_service():
    """Get code execution service singleton."""
    from app.modules.code_execution.service import CodeExecutionService

    return CodeExecutionService()


@lru_cache()
def get_dashboard_service():
    """Get dashboard service singleton."""
    from app.modules.dashboard.service import DashboardService

    return DashboardService()


@lru_cache()
def get_feedback_service():
    """Get feedback service singleton."""
    from app.modules.feedback.service import FeedbackService

    return FeedbackService()


@lru_cache()
def get_llm_service():
    """Get LLM service singleton."""
    from app.modules.llm.service import LLMService

    return LLMService()


@lru_cache()
def get_practice_service():
    """Get practice service singleton."""
    from app.modules.practices.service import PracticeService

    return PracticeService()


@lru_cache()
def get_interviewer_service():
    """Get interviewer service singleton."""
    from app.modules.websocket.service import InterviewerService

    return InterviewerService()


# ============================================================================
# Authorization Dependencies
# ============================================================================


def require_admin(
    current_user=Depends(get_current_user),
):
    """
    Require user to be an admin.

    Args:
        current_user: Current authenticated user

    Returns:
        User: Admin user object

    Raises:
        HTTPException: If user is not an admin
    """
    if not hasattr(current_user, "is_admin") or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


def require_verified_email(
    current_user=Depends(get_current_user),
):
    """
    Require user to have verified email.

    Args:
        current_user: Current authenticated user

    Returns:
        User: User with verified email

    Raises:
        HTTPException: If email is not verified
    """
    if hasattr(current_user, "email_verified") and not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Email verification required"
        )
    return current_user


# ============================================================================
# Pagination Dependencies
# ============================================================================


class PaginationParams:
    """Pagination parameters for list endpoints."""

    def __init__(
        self,
        skip: int = 0,
        limit: int = 100,
    ):
        self.skip = max(0, skip)  # Ensure non-negative
        self.limit = min(max(1, limit), 1000)  # Between 1 and 1000


def get_pagination_params(
    skip: int = 0,
    limit: int = 100,
) -> PaginationParams:
    """
    Get pagination parameters with validation.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        PaginationParams: Validated pagination parameters
    """
    return PaginationParams(skip=skip, limit=limit)


# ============================================================================
# Resource Access Dependencies
# ============================================================================


def get_assessment_by_id(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get assessment by ID with ownership verification.

    Args:
        assessment_id: Assessment ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Assessment: Assessment object

    Raises:
        HTTPException: If assessment not found or access denied
    """
    from app.modules.assessments.models import Assessment

    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found"
        )

    # Check ownership (or admin access)
    is_owner = assessment.user_id == current_user.id
    is_admin = hasattr(current_user, "is_admin") and current_user.is_admin

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this assessment",
        )

    return assessment


def get_practice_by_id(
    practice_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get practice by ID with ownership verification.

    Args:
        practice_id: Practice ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Practice: Practice object

    Raises:
        HTTPException: If practice not found or access denied
    """
    from app.modules.practices.models import Practice

    practice = db.query(Practice).filter(Practice.id == practice_id).first()

    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Practice not found"
        )

    # Check ownership
    is_owner = practice.user_id == current_user.id
    is_admin = hasattr(current_user, "is_admin") and current_user.is_admin

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this practice",
        )

    return practice


# ============================================================================
# Utility Dependencies
# ============================================================================


def get_request_id(
    x_request_id: Optional[str] = None,
) -> str:
    """
    Get or generate request ID for tracing.

    Args:
        x_request_id: Request ID from header

    Returns:
        str: Request ID
    """
    import uuid

    return x_request_id or str(uuid.uuid4())


def get_client_ip(
    x_forwarded_for: Optional[str] = None,
    x_real_ip: Optional[str] = None,
) -> Optional[str]:
    """
    Get client IP address from headers.

    Args:
        x_forwarded_for: X-Forwarded-For header
        x_real_ip: X-Real-IP header

    Returns:
        Optional[str]: Client IP address
    """
    if x_forwarded_for:
        # Get first IP if multiple
        return x_forwarded_for.split(",")[0].strip()
    return x_real_ip


# ============================================================================
# Rate Limiting Dependencies (Optional)
# ============================================================================


class RateLimitConfig:
    """Rate limit configuration."""

    def __init__(
        self,
        max_requests: int,
        window_seconds: int,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds


def rate_limit(
    max_requests: int = 100,
    window_seconds: int = 60,
) -> RateLimitConfig:
    """
    Rate limiting dependency factory.

    Usage:
        @app.get("/endpoint")
        async def endpoint(
            rate_config: RateLimitConfig = Depends(rate_limit(max_requests=10, window_seconds=60))
        ):
            ...

    Args:
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds

    Returns:
        RateLimitConfig: Rate limit configuration
    """
    return RateLimitConfig(
        max_requests=max_requests,
        window_seconds=window_seconds,
    )
