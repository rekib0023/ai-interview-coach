"""Enhanced WebSocket endpoint with AI interviewer logic."""

import logging
from typing import Optional

from fastapi import APIRouter, Cookie, WebSocket

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/{assessment_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    assessment_id: int,
    access_token: Optional[str] = Cookie(None, alias="access_token"),
):
    """
    Enhanced WebSocket endpoint for real-time interview chat with AI interviewer.

    Message format:
    - User messages: {"type": "user_message", "content": "..."}
    - System commands: {"type": "command", "action": "hint" | "repeat" | ...}
    - AI responses: {"type": "ai_message", "content": "..."}
    """
    from app.modules.websocket.chat_session import ChatSession

    session = ChatSession(websocket, assessment_id, access_token)
    await session.start_session()
