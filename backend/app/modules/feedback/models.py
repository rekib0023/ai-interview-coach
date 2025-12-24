"""Feedback run models for storing AI feedback results."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.shared.base_model import Base, UUIDMixin


class FeedbackStatus(str, PyEnum):
    """Feedback run status."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EvaluationRubric(UUIDMixin, Base):
    """Model for evaluation rubrics."""

    __tablename__ = "evaluation_rubrics"

    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    criteria = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    feedback_runs = relationship("FeedbackRun", back_populates="rubric")


class FeedbackRun(UUIDMixin, Base):
    """Model for storing AI feedback results."""

    __tablename__ = "feedback_runs"

    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rubric_id = Column(
        UUID(as_uuid=True),
        ForeignKey("evaluation_rubrics.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Status tracking
    status = Column(
        Enum(FeedbackStatus, values_callable=lambda x: [e.value for e in x]),
        default=FeedbackStatus.PENDING,
        nullable=False,
    )

    # Model information
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    prompt_id = Column(String(100), nullable=True, index=True)
    prompt_template_version = Column(String(50), nullable=True)

    # Scoring results
    overall_score = Column(Integer, nullable=True)
    criterion_scores = Column(JSON, nullable=True)

    # Feedback content
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    detailed_feedback = Column(Text, nullable=True)

    # Safety and quality flags
    safety_flags = Column(JSON, nullable=True)
    content_filtered = Column(Boolean, default=False, nullable=False)
    refusal_reason = Column(String(255), nullable=True)

    # Observability - costs and timing
    latency_ms = Column(Integer, nullable=True)
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    total_cost_usd = Column(Float, nullable=True)

    # Error handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="feedback_runs")
    rubric = relationship("EvaluationRubric", back_populates="feedback_runs")
    practices = relationship(
        "Practice", back_populates="feedback_run", cascade="all, delete-orphan"
    )
