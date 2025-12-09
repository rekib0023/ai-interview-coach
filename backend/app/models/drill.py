"""Drill models for follow-up practice exercises."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class DrillDifficulty(str, PyEnum):
    """Drill difficulty levels."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class DrillStatus(str, PyEnum):
    """Drill completion status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class DrillType(str, PyEnum):
    """Types of drill exercises."""

    PRACTICE_QUESTION = "practice_question"
    CODE_EXERCISE = "code_exercise"
    CONCEPT_REVIEW = "concept_review"
    MOCK_SCENARIO = "mock_scenario"


class Drill(Base):
    """Model for follow-up drill exercises."""

    __tablename__ = "drill"

    id = Column(Integer, primary_key=True, index=True)
    feedback_run_id = Column(
        Integer, ForeignKey("feedback_run.id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)

    # Drill content
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    drill_type = Column(
        Enum(DrillType, values_callable=lambda x: [e.value for e in x]),
        default=DrillType.PRACTICE_QUESTION,
        nullable=False,
    )
    difficulty = Column(
        Enum(DrillDifficulty, values_callable=lambda x: [e.value for e in x]),
        default=DrillDifficulty.MEDIUM,
        nullable=False,
    )

    # Target weakness/skill this drill addresses
    target_weakness = Column(String(255), nullable=True)
    target_skill = Column(String(255), nullable=True)

    # Expected answer/solution (for reference, not shown to user)
    expected_answer = Column(Text, nullable=True)
    hints = Column(Text, nullable=True)  # JSON array of hints

    # Status tracking
    status = Column(
        Enum(DrillStatus, values_callable=lambda x: [e.value for e in x]),
        default=DrillStatus.PENDING,
        nullable=False,
    )
    is_delivered = Column(Boolean, default=False, nullable=False)
    delivered_at = Column(DateTime, nullable=True)

    # User response tracking
    user_response = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)  # 0-100

    # Ordering for multi-drill sequences
    sequence_order = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    feedback_run = relationship("FeedbackRun", back_populates="drills")
    user = relationship("User", backref="drills")
