import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String

from app.shared.base_model import Base


class ChatSender(str, enum.Enum):
    USER = "user"
    AI = "ai"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessment.id"))
    sender = Column(Enum(ChatSender))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class MessageType(str, enum.Enum):
    """WebSocket message types."""

    USER_MESSAGE = "user_message"
    AI_MESSAGE = "ai_message"
    COMMAND = "command"
    ERROR = "error"
    STATUS = "status"
    TYPING = "typing"
    SYSTEM = "system"


class CommandAction(str, enum.Enum):
    """Supported command actions."""

    HINT = "hint"
    REPEAT = "repeat"
    SKIP = "skip"
    END = "end"
    STATUS = "status"
