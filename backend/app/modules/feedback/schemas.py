"""Pydantic schemas for feedback runs."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from .models import FeedbackStatus


# ============================================================================
# Request Schemas
# ============================================================================


class FeedbackRunCreate(BaseModel):
    """Schema for creating a new feedback run."""

    session_id: int
    rubric_id: Optional[int] = None


class FeedbackRunRequest(BaseModel):
    """Schema for requesting feedback on a session."""

    rubric_id: Optional[int] = None


# ============================================================================
# Response Schemas
# ============================================================================


class CriterionScore(BaseModel):
    """Schema for individual criterion score."""

    criterion_name: str
    score: int = Field(..., ge=0, le=100)
    feedback: Optional[str] = None


class FeedbackRunBase(BaseModel):
    """Base schema for feedback run."""

    session_id: int
    rubric_id: Optional[int] = None
    status: FeedbackStatus


class FeedbackRunInDB(FeedbackRunBase):
    """Schema for feedback run from database."""

    id: int
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    prompt_id: Optional[str] = None
    prompt_template_version: Optional[str] = None
    overall_score: Optional[int] = None
    criterion_scores: Optional[dict[str, int]] = None
    strengths: Optional[list[str]] = None
    weaknesses: Optional[list[str]] = None
    suggestions: Optional[list[str]] = None
    detailed_feedback: Optional[str] = None
    safety_flags: Optional[dict[str, bool]] = None
    content_filtered: bool = False
    refusal_reason: Optional[str] = None
    latency_ms: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_cost_usd: Optional[float] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeedbackRun(FeedbackRunInDB):
    """Schema for feedback run API response."""

    pass


class FeedbackRunSummary(BaseModel):
    """Lightweight summary of feedback run."""

    id: int
    session_id: int
    status: FeedbackStatus
    overall_score: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeedbackRunList(BaseModel):
    """Schema for list of feedback runs."""

    feedback_runs: list[FeedbackRunSummary]
    total: int


# ============================================================================
# Result Schemas
# ============================================================================


class FeedbackResult(BaseModel):
    """Schema for complete feedback result."""

    id: int
    session_id: int
    status: FeedbackStatus
    overall_score: Optional[int] = None
    criterion_scores: Optional[dict[str, int]] = None
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    detailed_feedback: Optional[str] = None
    rubric_name: Optional[str] = None
    rubric_version: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# Polling Response
# ============================================================================


class FeedbackStatusResponse(BaseModel):
    """Schema for feedback status polling."""

    id: int
    status: FeedbackStatus
    progress_message: Optional[str] = None
    estimated_completion_seconds: Optional[int] = None
