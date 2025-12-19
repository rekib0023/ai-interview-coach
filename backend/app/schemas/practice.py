"""Pydantic schemas for drills."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.practice import PracticeDifficulty, PracticeStatus, PracticeType

# ============================================================================
# Request Schemas
# ============================================================================


class PracticeCreate(BaseModel):
    """Schema for creating a new practice exercise."""

    feedback_run_id: int
    title: str = Field(..., min_length=1, max_length=255)
    prompt: str = Field(..., min_length=1)
    practice_type: PracticeType = PracticeType.PRACTICE_QUESTION
    difficulty: PracticeDifficulty = PracticeDifficulty.MEDIUM
    target_weakness: Optional[str] = Field(None, max_length=255)
    target_skill: Optional[str] = Field(None, max_length=255)
    expected_answer: Optional[str] = None
    hints: Optional[str] = None
    sequence_order: int = 0


class PracticeGenerateRequest(BaseModel):
    """Schema for requesting practice generation."""

    count: int = Field(3, ge=1, le=5)
    difficulty_ramp: bool = (
        False  # If true, generate practice with increasing difficulty
    )


class PracticeUpdate(BaseModel):
    """Schema for updating a practice exercise."""

    status: Optional[PracticeStatus] = None
    user_response: Optional[str] = None
    score: Optional[int] = Field(None, ge=0, le=100)


class PracticeSubmitResponse(BaseModel):
    """Schema for submitting practice response."""

    user_response: str = Field(..., min_length=1)


# ============================================================================
# Response Schemas
# ============================================================================


class PracticeBase(BaseModel):
    """Base schema for practice exercise."""

    title: str
    prompt: str
    practice_type: PracticeType
    difficulty: PracticeDifficulty
    target_weakness: Optional[str] = None
    target_skill: Optional[str] = None


class PracticeInDB(PracticeBase):
    """Schema for practice from database."""

    id: int
    feedback_run_id: int
    user_id: int
    status: PracticeStatus
    is_delivered: bool
    delivered_at: Optional[datetime] = None
    user_response: Optional[str] = None
    score: Optional[int] = None
    sequence_order: int
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Practice(PracticeInDB):
    """Schema for practice API response."""

    pass


class PracticeWithHints(Practice):
    """Schema for practice with hints (only shown when requested)."""

    hints: Optional[str] = None


class PracticeSummary(BaseModel):
    """Lightweight summary of practice exercise."""

    id: int
    title: str
    practice_type: PracticeType
    difficulty: PracticeDifficulty
    status: PracticeStatus
    score: Optional[int] = None

    class Config:
        from_attributes = True


class PracticeList(BaseModel):
    """Schema for list of practice exercises."""

    practices: list[PracticeSummary]
    total: int


# ============================================================================
# Generation Result
# ============================================================================


class PracticeGenerationResult(BaseModel):
    """Schema for practice generation result."""

    practices: list[Practice]
    feedback_run_id: int
    count: int
