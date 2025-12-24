"""WebSocket models for chat functionality."""

import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.shared.base_model import Base, UUIDMixin


class ChatSender(str, enum.Enum):
    """Chat message sender types."""

    USER = "user"
    AI = "ai"


class Message(UUIDMixin, Base):
    """Model for storing chat messages."""

    __tablename__ = "messages"

    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender = Column(Enum(ChatSender), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="messages")


class MessageType(str, enum.Enum):
    """WebSocket message types."""

    USER_MESSAGE = "user_message"
    AI_MESSAGE = "ai_message"
    COMMAND = "command"
    ERROR = "error"
    STATUS = "status"
    TYPING = "typing"
    SYSTEM = "system"
    # Streaming types
    STREAM_START = "stream_start"
    STREAM_CHUNK = "stream_chunk"
    STREAM_END = "stream_end"


class CommandAction(str, enum.Enum):
    """Supported command actions."""

    HINT = "hint"
    REPEAT = "repeat"
    SKIP = "skip"
    END = "end"
    STATUS = "status"
