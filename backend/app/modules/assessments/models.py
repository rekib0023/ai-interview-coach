"""Assessment model for storing interview session data."""

from enum import Enum as PyEnum

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.shared.base_model import Base, TimestampMixin, UUIDMixin


class DifficultyLevel(str, PyEnum):
    """Interview difficulty levels."""

    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class AssessmentStatus(str, PyEnum):
    """Interview session status."""

    CREATED = "created"
    IN_PROGRESS = "in_progress"
    AWAITING_FEEDBACK = "awaiting_feedback"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Assessment(UUIDMixin, TimestampMixin, Base):
    """Model for storing assessment (interview) session data."""

    __tablename__ = "assessments"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Interview setup
    topic = Column(String(255), nullable=False)
    role = Column(String(100), nullable=True)
    difficulty = Column(
        Enum(DifficultyLevel), nullable=False, default=DifficultyLevel.MEDIUM
    )
    skill_targets = Column(JSON, nullable=True)

    # Interview content
    question = Column(Text, nullable=True)
    question_context = Column(Text, nullable=True)

    # User response
    response_text = Column(Text, nullable=True)
    response_audio_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    transcript_status = Column(String(50), nullable=True)

    # Status & scoring
    status = Column(
        Enum(AssessmentStatus, values_callable=lambda x: [e.value for e in x]),
        default=AssessmentStatus.CREATED,
        nullable=False,
    )
    score = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)

    # Metadata
    session_metadata = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", backref="assessments")
    feedback_runs = relationship(
        "FeedbackRun", back_populates="assessment", cascade="all, delete-orphan"
    )
    code_submissions = relationship(
        "CodeSubmission", back_populates="assessment", cascade="all, delete-orphan"
    )
    messages = relationship(
        "Message", back_populates="assessment", cascade="all, delete-orphan"
    )
