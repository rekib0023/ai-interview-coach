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
from sqlalchemy.orm import relationship

from app.shared.base_model import Base


class FeedbackStatus(str, PyEnum):
    """Feedback run status."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class FeedbackRun(Base):
    """Model for storing AI feedback results."""

    __tablename__ = "feedback_run"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer, ForeignKey("assessment.id"), nullable=False, index=True
    )
    rubric_id = Column(
        Integer, ForeignKey("evaluation_rubric.id"), nullable=True, index=True
    )

    # Status tracking
    status = Column(
        Enum(FeedbackStatus, values_callable=lambda x: [e.value for e in x]),
        default=FeedbackStatus.PENDING,
        nullable=False,
    )

    # Model information
    model_name = Column(String(100), nullable=True)  # e.g., "gpt-4", "claude-3"
    model_version = Column(String(50), nullable=True)
    prompt_id = Column(
        String(100), nullable=True, index=True
    )  # For prompt versioning/tracking
    prompt_template_version = Column(String(50), nullable=True)

    # Scoring results
    overall_score = Column(Integer, nullable=True)  # 0-100
    # Detailed scores stored as JSON: {"criterion_name": score, ...}
    criterion_scores = Column(JSON, nullable=True)

    # Feedback content
    strengths = Column(JSON, nullable=True)  # List of strength strings
    weaknesses = Column(JSON, nullable=True)  # List of weakness strings
    suggestions = Column(JSON, nullable=True)  # List of suggestion strings
    detailed_feedback = Column(Text, nullable=True)  # Full markdown feedback

    # Safety and quality flags
    safety_flags = Column(JSON, nullable=True)  # {"flag_name": bool, ...}
    content_filtered = Column(Boolean, default=False, nullable=False)
    refusal_reason = Column(String(255), nullable=True)

    # Observability - costs and timing
    latency_ms = Column(Integer, nullable=True)  # Processing time in milliseconds
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    total_cost_usd = Column(Float, nullable=True)  # Estimated cost in USD

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
    practices = relationship("Practice", back_populates="feedback_run")
