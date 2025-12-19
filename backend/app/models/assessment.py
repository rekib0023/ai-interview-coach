"""Interview session model for storing interview history."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


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


class Assessment(Base):
    """Model for storing assessment (interview) session data."""

    __tablename__ = "assessment"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    difficulty = Column(
        Enum(DifficultyLevel), nullable=False, default=DifficultyLevel.MEDIUM
    )
    score = Column(Integer, nullable=True)  # 0-100
    duration_minutes = Column(Integer, nullable=True)

    # Session status
    status = Column(
        Enum(AssessmentStatus, values_callable=lambda x: [e.value for e in x]),
        default=AssessmentStatus.CREATED,
        nullable=False,
    )

    # Role and skill targeting
    role = Column(
        String(100), nullable=True
    )  # e.g., "Software Engineer", "Data Scientist"
    skill_targets = Column(JSON, nullable=True)  # List of skill areas being tested

    # Interview content
    question = Column(Text, nullable=True)  # The interview question
    question_context = Column(
        Text, nullable=True
    )  # Additional context for the question

    # User responses
    response_audio_url = Column(
        String(500), nullable=True
    )  # URL to audio file if audio response
    response_text = Column(Text, nullable=True)  # Text response or transcript
    transcript = Column(
        Text, nullable=True
    )  # Full transcript (if transcribed from audio)
    transcript_status = Column(String(50), nullable=True)  # pending, completed, failed

    # Metadata
    session_metadata = Column(JSON, nullable=True)  # Additional session metadata

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    # Relationships
    user = relationship("User", backref="assessments")
    feedback_runs = relationship("FeedbackRun", back_populates="assessment")
