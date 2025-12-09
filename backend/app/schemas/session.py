"""Pydantic schemas for interview sessions."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.interview_session import DifficultyLevel, SessionStatus

# ============================================================================
# Base Schemas
# ============================================================================


class InterviewSessionBase(BaseModel):
    """Base schema for interview session."""

    topic: str = Field(..., min_length=1, max_length=255)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    role: Optional[str] = Field(None, max_length=100)
    skill_targets: Optional[list[str]] = None
    question: Optional[str] = None
    question_context: Optional[str] = None


class InterviewSessionCreate(InterviewSessionBase):
    """Schema for creating a new interview session."""

    pass


class InterviewSessionUpdate(BaseModel):
    """Schema for updating an interview session."""

    topic: Optional[str] = Field(None, max_length=255)
    difficulty: Optional[DifficultyLevel] = None
    status: Optional[SessionStatus] = None
    role: Optional[str] = Field(None, max_length=100)
    skill_targets: Optional[list[str]] = None
    question: Optional[str] = None
    question_context: Optional[str] = None
    response_audio_url: Optional[str] = Field(None, max_length=500)
    response_text: Optional[str] = None
    transcript: Optional[str] = None
    transcript_status: Optional[str] = None
    score: Optional[int] = Field(None, ge=0, le=100)
    duration_minutes: Optional[int] = Field(None, ge=0)
    session_metadata: Optional[dict] = None


class InterviewSessionSubmitResponse(BaseModel):
    """Schema for submitting a response to an interview session."""

    response_text: Optional[str] = None
    response_audio_url: Optional[str] = Field(None, max_length=500)


# ============================================================================
# Response Schemas
# ============================================================================


class InterviewSessionInDB(InterviewSessionBase):
    """Schema for interview session from database."""

    id: int
    user_id: int
    status: SessionStatus
    score: Optional[int] = None
    duration_minutes: Optional[int] = None
    response_audio_url: Optional[str] = None
    response_text: Optional[str] = None
    transcript: Optional[str] = None
    transcript_status: Optional[str] = None
    session_metadata: Optional[dict] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewSession(InterviewSessionInDB):
    """Schema for interview session API response."""

    pass


class InterviewSessionList(BaseModel):
    """Schema for paginated list of interview sessions."""

    sessions: list[InterviewSession]
    total: int
    page: int
    page_size: int


# ============================================================================
# Summary Schema
# ============================================================================


class InterviewSessionSummary(BaseModel):
    """Lightweight summary of interview session."""

    id: int
    topic: str
    difficulty: DifficultyLevel
    status: SessionStatus
    score: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
