"""Common dependencies for API endpoints."""

from functools import lru_cache
from typing import Generator

from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal


def get_db() -> Generator:
    """Get database session."""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    access_token: str = Cookie(None, alias="access_token"),
):
    """Get current authenticated user from JWT token in cookie."""
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
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


@lru_cache()
def get_user_service():
    from app.modules.users.service import UserService

    return UserService()


@lru_cache()
def get_assessment_service():
    from app.modules.assessments.service import AssessmentService

    return AssessmentService()


@lru_cache()
def get_code_execution_service():
    from app.modules.code_execution.service import CodeExecutionService

    return CodeExecutionService()


@lru_cache()
def get_dashboard_service():
    from app.modules.dashboard.service import DashboardService

    return DashboardService()


@lru_cache()
def get_feedback_service():
    from app.modules.feedback.service import FeedbackService

    return FeedbackService()


@lru_cache()
def get_llm_service():
    from app.modules.llm.service import LLMService

    return LLMService()


@lru_cache()
def get_practice_service():
    from app.modules.practices.service import PracticeService

    return PracticeService()


@lru_cache()
def get_interviewer_service():
    from app.modules.websocket.service import InterviewerService

    return InterviewerService()
