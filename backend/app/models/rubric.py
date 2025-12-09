"""Evaluation rubric models for scoring interviews."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text, Boolean, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


class RubricCategory(str, PyEnum):
    """Rubric category types."""
    SYSTEM_DESIGN = "system_design"
    BEHAVIORAL = "behavioral"
    CODING = "coding"
    TECHNICAL = "technical"
    COMMUNICATION = "communication"


class EvaluationRubric(Base):
    """Model for versioned evaluation rubrics."""

    __tablename__ = "evaluation_rubric"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    version = Column(String(50), nullable=False, index=True)
    category = Column(Enum(RubricCategory), nullable=False)
    description = Column(Text, nullable=True)

    # Rubric criteria stored as JSON for flexibility
    # Structure: [{"name": str, "weight": float, "description": str, "levels": [...]}]
    criteria = Column(JSON, nullable=False)

    # Scoring configuration
    max_score = Column(Integer, default=100, nullable=False)
    passing_score = Column(Integer, default=70, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    feedback_runs = relationship("FeedbackRun", back_populates="rubric")
