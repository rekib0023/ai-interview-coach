"""Pydantic schemas for evaluation rubrics."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.rubric import RubricCategory


# ============================================================================
# Criterion Schemas
# ============================================================================


class RubricLevel(BaseModel):
    """Schema for a scoring level within a criterion."""

    score: int = Field(..., ge=0, le=100)
    label: str = Field(..., min_length=1, max_length=50)
    description: str


class RubricCriterion(BaseModel):
    """Schema for a single rubric criterion."""

    name: str = Field(..., min_length=1, max_length=100)
    weight: float = Field(..., ge=0, le=1)
    description: str
    levels: list[RubricLevel]


# ============================================================================
# Base Schemas
# ============================================================================


class EvaluationRubricBase(BaseModel):
    """Base schema for evaluation rubric."""

    name: str = Field(..., min_length=1, max_length=255)
    version: str = Field(..., min_length=1, max_length=50)
    category: RubricCategory
    description: Optional[str] = None
    criteria: list[RubricCriterion]
    max_score: int = Field(100, ge=1, le=1000)
    passing_score: int = Field(70, ge=0)


class EvaluationRubricCreate(EvaluationRubricBase):
    """Schema for creating a new evaluation rubric."""

    pass


class EvaluationRubricUpdate(BaseModel):
    """Schema for updating an evaluation rubric."""

    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    criteria: Optional[list[RubricCriterion]] = None
    max_score: Optional[int] = Field(None, ge=1, le=1000)
    passing_score: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


# ============================================================================
# Response Schemas
# ============================================================================


class EvaluationRubricInDB(EvaluationRubricBase):
    """Schema for evaluation rubric from database."""

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EvaluationRubric(EvaluationRubricInDB):
    """Schema for evaluation rubric API response."""

    pass


class EvaluationRubricList(BaseModel):
    """Schema for list of evaluation rubrics."""

    rubrics: list[EvaluationRubric]
    total: int


class EvaluationRubricSummary(BaseModel):
    """Lightweight summary of evaluation rubric."""

    id: int
    name: str
    version: str
    category: RubricCategory
    is_active: bool

    class Config:
        from_attributes = True
