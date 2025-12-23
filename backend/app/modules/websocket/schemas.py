"""Pydantic schemas for websocket messages."""

from datetime import datetime

from pydantic import BaseModel

from .models import ChatSender


class MessageCreate(BaseModel):
    """Schema for creating a new message."""

    assessment_id: int
    sender: ChatSender
    content: str


class MessageResponse(BaseModel):
    """Schema for message responses."""

    id: int
    assessment_id: int
    sender: ChatSender
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
