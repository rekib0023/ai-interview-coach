"""Practice models for follow-up practice exercises."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.shared.base_model import Base, UUIDMixin


class PracticeDifficulty(str, PyEnum):
    """Practice difficulty levels."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class PracticeStatus(str, PyEnum):
    """Practice completion status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class PracticeType(str, PyEnum):
    """Types of practice exercises."""

    PRACTICE_QUESTION = "practice_question"
    CODE_EXERCISE = "code_exercise"
    CONCEPT_REVIEW = "concept_review"
    MOCK_SCENARIO = "mock_scenario"


class Practice(UUIDMixin, Base):
    """Model for follow-up practice exercises."""

    __tablename__ = "practices"

    feedback_run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("feedback_runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Practice content
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    practice_type = Column(
        Enum(PracticeType, values_callable=lambda x: [e.value for e in x]),
        default=PracticeType.PRACTICE_QUESTION,
        nullable=False,
    )
    difficulty = Column(
        Enum(PracticeDifficulty, values_callable=lambda x: [e.value for e in x]),
        default=PracticeDifficulty.MEDIUM,
        nullable=False,
    )

    # Target weakness/skill this practice addresses
    target_weakness = Column(String(255), nullable=True)
    target_skill = Column(String(255), nullable=True)

    # Expected answer/solution (for reference, not shown to user)
    expected_answer = Column(Text, nullable=True)
    hints = Column(JSON, nullable=True)  # JSON array of hints

    # Status tracking
    status = Column(
        Enum(PracticeStatus, values_callable=lambda x: [e.value for e in x]),
        default=PracticeStatus.PENDING,
        nullable=False,
    )
    is_delivered = Column(Boolean, default=False, nullable=False)
    delivered_at = Column(DateTime, nullable=True)

    # User response tracking
    user_response = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)

    # Ordering for multi-practice sequences
    sequence_order = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    feedback_run = relationship("FeedbackRun", back_populates="practices")
    user = relationship("User", backref="practices")
