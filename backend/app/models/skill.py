"""Skill models for tracking user skill progress."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base


class Skill(Base):
    """Model for skill categories/topics."""

    __tablename__ = "skill"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    category = Column(
        String, nullable=True
    )  # e.g., "algorithms", "system_design", "behavioral"

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class UserSkill(Base):
    """Model for tracking user progress on specific skills."""

    __tablename__ = "user_skill"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skill.id"), nullable=False, index=True)

    # Progress tracking (0-100)
    progress = Column(Integer, default=0, nullable=False)

    # Historical progress for trend calculation
    previous_progress = Column(Integer, nullable=True)

    # Whether this is a strength or area to improve
    is_strength = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", backref="user_skills")
    skill = relationship("Skill", backref="user_skills")
