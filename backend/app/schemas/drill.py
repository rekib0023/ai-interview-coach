"""Pydantic schemas for drills."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.drill import DrillDifficulty, DrillStatus, DrillType


# ============================================================================
# Request Schemas
# ============================================================================

class DrillCreate(BaseModel):
    """Schema for creating a new drill."""
    feedback_run_id: int
    title: str = Field(..., min_length=1, max_length=255)
    prompt: str = Field(..., min_length=1)
    drill_type: DrillType = DrillType.PRACTICE_QUESTION
    difficulty: DrillDifficulty = DrillDifficulty.MEDIUM
    target_weakness: Optional[str] = Field(None, max_length=255)
    target_skill: Optional[str] = Field(None, max_length=255)
    expected_answer: Optional[str] = None
    hints: Optional[str] = None
    sequence_order: int = 0


class DrillGenerateRequest(BaseModel):
    """Schema for requesting drill generation."""
    count: int = Field(3, ge=1, le=5)
    difficulty_ramp: bool = False  # If true, generate drills with increasing difficulty


class DrillUpdate(BaseModel):
    """Schema for updating a drill."""
    status: Optional[DrillStatus] = None
    user_response: Optional[str] = None
    score: Optional[int] = Field(None, ge=0, le=100)


class DrillSubmitResponse(BaseModel):
    """Schema for submitting drill response."""
    user_response: str = Field(..., min_length=1)


# ============================================================================
# Response Schemas
# ============================================================================

class DrillBase(BaseModel):
    """Base schema for drill."""
    title: str
    prompt: str
    drill_type: DrillType
    difficulty: DrillDifficulty
    target_weakness: Optional[str] = None
    target_skill: Optional[str] = None


class DrillInDB(DrillBase):
    """Schema for drill from database."""
    id: int
    feedback_run_id: int
    user_id: int
    status: DrillStatus
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


class Drill(DrillInDB):
    """Schema for drill API response."""
    pass


class DrillWithHints(Drill):
    """Schema for drill with hints (only shown when requested)."""
    hints: Optional[str] = None


class DrillSummary(BaseModel):
    """Lightweight summary of drill."""
    id: int
    title: str
    drill_type: DrillType
    difficulty: DrillDifficulty
    status: DrillStatus
    score: Optional[int] = None

    class Config:
        from_attributes = True


class DrillList(BaseModel):
    """Schema for list of drills."""
    drills: list[DrillSummary]
    total: int


# ============================================================================
# Generation Result
# ============================================================================

class DrillGenerationResult(BaseModel):
    """Schema for drill generation result."""
    drills: list[Drill]
    feedback_run_id: int
    count: int
