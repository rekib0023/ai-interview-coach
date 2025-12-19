"""Message model for storing the conversations"""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class ChatSender(str, PyEnum):
    USER = "user"
    AI = "ai"


class Message(Base):
    """Model for storing messages"""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    assessment_id = Column(
        Integer, ForeignKey("assessment.id"), nullable=False, index=True
    )
    sender = Column(Enum(ChatSender), nullable=False)
    content = Column(String, nullable=False)

    # Relationships
    assessment = relationship("Assessment", backref="messages")
