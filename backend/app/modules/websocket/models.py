import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String

from app.core.database import Base


class ChatSender(str, enum.Enum):
    USER = "user"
    AI = "ai"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    sender = Column(Enum(ChatSender))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
