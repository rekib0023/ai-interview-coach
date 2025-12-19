"""Pydantic schemas for interview sessions."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.assessment import AssessmentStatus, DifficultyLevel

# ============================================================================
# Base Schemas
# ============================================================================


class AssessmentBase(BaseModel):
    """Base schema for assessment session."""

    topic: str = Field(..., min_length=1, max_length=255)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    role: Optional[str] = Field(None, max_length=100)
    skill_targets: Optional[list[str]] = None
    question: Optional[str] = None
    question_context: Optional[str] = None


class AssessmentCreate(AssessmentBase):
    """Schema for creating a new assessment session."""

    pass


class AssessmentUpdate(BaseModel):
    """Schema for updating an assessment session."""

    topic: Optional[str] = Field(None, max_length=255)
    difficulty: Optional[DifficultyLevel] = None
    status: Optional[AssessmentStatus] = None
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


class AssessmentSubmitResponse(BaseModel):
    """Schema for submitting a response to an assessment session."""

    response_text: Optional[str] = None
    response_audio_url: Optional[str] = Field(None, max_length=500)


# ============================================================================
# Response Schemas
# ============================================================================


class AssessmentInDB(AssessmentBase):
    """Schema for assessment session from database."""

    id: int
    user_id: int
    status: AssessmentStatus
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


class Assessment(AssessmentInDB):
    """Schema for assessment session API response."""

    pass


class AssessmentList(BaseModel):
    """Schema for paginated list of assessment sessions."""

    assessments: list[Assessment]
    total: int
    page: int
    page_size: int


# ============================================================================
# Summary Schema
# ============================================================================


class AssessmentSummary(BaseModel):
    """Lightweight summary of assessment session."""

    id: int
    topic: str
    difficulty: DifficultyLevel
    status: AssessmentStatus
    score: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
