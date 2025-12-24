"""
WebSocket Interviewer Service with streaming Markdown responses.

Provides AI interviewer functionality using the LLM service with:
- Conversation memory management
- Pure Markdown streaming (no JSON parsing)
- AI response generation
"""

import logging
from typing import List, Tuple

from sqlalchemy.orm import Session

from app.core.dependencies import get_assessment_service
from app.modules.assessments.models import Assessment, AssessmentStatus
from app.modules.websocket.models import ChatSender, Message

from .crud import message as message_crud

logger = logging.getLogger(__name__)


class MessageService:
    """
    Service for AI interviewer with streaming Markdown responses.
    Handles business logic for interview sessions.
    """

    # =========================================================================
    # Message Management
    # =========================================================================

    async def save_message(
        self,
        db: Session,
        assessment_id: int,
        sender: ChatSender,
        content: str,
    ) -> Message:
        """Save a new message to the database."""
        from .schemas import MessageCreate

        message_in = MessageCreate(
            assessment_id=assessment_id,
            sender=sender,
            content=content,
        )
        return message_crud.create(db=db, obj_in=message_in)

    def get_chat_history(self, db: Session, assessment_id: int) -> List[Message]:
        """Get chat history for an assessment."""

        return message_crud.get_by_assessment(db, assessment_id=assessment_id)

    # =========================================================================
    # AI Response Generation
    # =========================================================================

    def generate_welcome_message(self) -> str:
        """Generate the initial welcome message for a new interview session."""
        return "Welcome to the interview! Let's begin."

    async def generate_and_save_ai_response(
        self,
        db: Session,
        assessment: Assessment,
        user_input: str,
    ) -> Tuple[Message, bool]:
        """
        Generate AI response based on user input and conversation history.

        Args:
            db: Database session
            assessment: Current assessment
            user_input: User's latest message

        Returns:
            Tuple of (AI message, is_completed) where is_completed indicates
            if the interview should be marked as completed
        """
        # Fetch conversation history for context
        history = self.get_chat_history(db, assessment.id)

        # TODO: Integrate with actual LLM service for AI generation
        # Use history and user_input to build context for the LLM
        # For now, placeholder response
        full_response = (
            "This is a placeholder AI response. Integration with LLM pending."
        )

        # Save AI message
        ai_msg = await self.save_message(
            db, assessment.id, ChatSender.AI, full_response
        )

        # Check for completion marker
        is_completed = "`COMPLETED`" in full_response

        if is_completed:
            assessment_service = get_assessment_service()
            assessment_service.update_assessment_status(
                db=db,
                assessment_id=assessment.id,
                user_id=assessment.user_id,
                new_status=AssessmentStatus.COMPLETED,
            )
            logger.info(f"Interview completed for assessment {assessment.id}")

        return ai_msg, is_completed


message_service = MessageService()
