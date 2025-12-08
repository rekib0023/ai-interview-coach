"""Weekly goal model for tracking user goals."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base


class GoalPriority(str, PyEnum):
    """Goal priority levels."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class WeeklyGoal(Base):
    """Model for weekly user goals."""

    __tablename__ = "weekly_goal"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)

    label = Column(String, nullable=False)
    current = Column(Integer, default=0, nullable=False)
    total = Column(Integer, nullable=False)
    priority = Column(Enum(GoalPriority), default=GoalPriority.MEDIUM, nullable=False)

    # Goal tracking
    is_completed = Column(Boolean, default=False, nullable=False)

    # Week tracking (ISO week number and year)
    week_number = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="weekly_goals")
