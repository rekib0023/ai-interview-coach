"""
WebSocket Interviewer Service with streaming Markdown responses.

Provides AI interviewer functionality using the LLM service with:
- Conversation memory management
- Pure Markdown streaming (no JSON parsing)
"""

import logging
from datetime import datetime
from typing import AsyncIterator, List, Optional

from sqlalchemy.orm import Session

from app.core.dependencies import get_llm_service
from app.modules.assessments.models import Assessment
from app.modules.llm.prompts import get_interview_system_prompt
from app.modules.llm.schemas import ConversationMemory
from app.modules.websocket.models import ChatSender, Message

logger = logging.getLogger(__name__)


class InterviewerService:
    """
    Service for AI interviewer with streaming Markdown responses.
    """

    def _build_memory_from_history(
        self,
        history: List[Message],
        system_instruction: str,
        assessment_id: int,
    ) -> ConversationMemory:
        """
        Build a ConversationMemory from database message history.

        Args:
            history: List of Message objects from database
            system_instruction: System prompt for the interview
            assessment_id: Assessment ID for tracking

        Returns:
            ConversationMemory populated with history
        """
        memory = ConversationMemory(
            system_instruction=system_instruction,
            max_messages=50,
            conversation_id=f"assessment-{assessment_id}",
        )

        for msg in history:
            if msg.sender == ChatSender.AI:
                memory.add_model_message(msg.content)
            else:
                memory.add_user_message(msg.content)

        return memory

    async def generate_initial_session_stream(
        self,
        assessment: Assessment,
    ) -> AsyncIterator[str]:
        """
        Stream the initial interview intro and first question.

        Yields Markdown text chunks for immediate frontend display.
        """
        llm_service = get_llm_service()

        system_prompt = get_interview_system_prompt(
            topic=assessment.topic,
            role=assessment.role or "Software Engineer",
            difficulty=assessment.difficulty.value,
            focus_skills=assessment.skill_targets or [],
        )

        user_prompt = (
            "Start the interview. Introduce yourself and ask the first question."
        )

        async for chunk in llm_service.generate_stream(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.7,
            max_tokens=1000,
        ):
            if chunk.content:
                yield chunk.content

    async def generate_initial_session(
        self,
        assessment: Assessment,
    ) -> str:
        """
        Generate the initial interview message (non-streaming fallback).

        Returns the complete Markdown response.
        """
        llm_service = get_llm_service()

        system_prompt = get_interview_system_prompt(
            topic=assessment.topic,
            role=assessment.role or "Software Engineer",
            difficulty=assessment.difficulty.value,
            focus_skills=assessment.skill_targets or [],
        )

        try:
            response = await llm_service.generate(
                system_prompt=system_prompt,
                user_prompt="Start the interview. Introduce yourself and ask the first question.",
                temperature=0.7,
                max_tokens=1000,
            )
            return response.content
        except Exception as e:
            logger.error(f"Failed to generate initial session: {e}")
            return f"""### Welcome

Hello! I'm your AI interviewer today. Welcome to your **{assessment.topic}** interview.

### Next Question

Could you please start by briefly describing your background and experience relevant to this role?

### Status
`IN_PROGRESS`
"""

    async def save_message(
        self,
        db: Session,
        assessment_id: int,
        sender: ChatSender,
        content: str,
    ) -> Message:
        """Save a new message to the database."""
        message = Message(
            assessment_id=assessment_id,
            sender=sender,
            content=content,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    async def generate_ai_response_stream(
        self,
        assessment: Assessment,
        user_message: str,
        history: List[Message],
    ) -> AsyncIterator[str]:
        """
        Stream AI response chunks for real-time WebSocket delivery.

        This is the main streaming method. Yields Markdown text chunks
        that can be sent directly to the frontend.

        Args:
            assessment: Current assessment
            user_message: Latest user message
            history: Chat history from database

        Yields:
            Markdown text chunks as they stream from the LLM
        """
        llm_service = get_llm_service()

        # Calculate time context
        time_context = "Interview just started."
        if assessment.created_at:
            elapsed_minutes = (
                datetime.utcnow() - assessment.created_at
            ).total_seconds() / 60
            time_context = (
                f"Interview has been running for {int(elapsed_minutes)} minutes."
            )
            if elapsed_minutes < 25:
                time_context += (
                    " DO NOT COMPLETE THE INTERVIEW YET. Continue asking questions."
                )
            else:
                time_context += (
                    " You may complete the interview if you have sufficient signal."
                )

        system_prompt = get_interview_system_prompt(
            topic=assessment.topic,
            role=assessment.role or "Software Engineer",
            difficulty=assessment.difficulty.value,
            focus_skills=assessment.skill_targets or [],
            time_context=time_context,
        )

        memory = self._build_memory_from_history(
            history=history,
            system_instruction=system_prompt,
            assessment_id=assessment.id,
        )

        async for chunk in llm_service.generate_stream_with_memory(
            memory=memory,
            user_message=user_message,
            temperature=0.7,
            max_tokens=1000,
        ):
            if chunk.content:
                yield chunk.content

    async def generate_ai_response(
        self,
        assessment: Assessment,
        user_message: str,
        history: List[Message],
    ) -> str:
        """
        Generate complete AI response (non-streaming fallback).

        Returns the complete Markdown response for cases where
        streaming is not needed (e.g., saving to database).
        """
        llm_service = get_llm_service()

        system_prompt = get_interview_system_prompt(
            topic=assessment.topic,
            role=assessment.role or "Software Engineer",
            difficulty=assessment.difficulty.value,
            focus_skills=assessment.skill_targets or [],
        )

        memory = self._build_memory_from_history(
            history=history,
            system_instruction=system_prompt,
            assessment_id=assessment.id,
        )

        try:
            response = await llm_service.generate_with_memory(
                memory=memory,
                user_message=user_message,
                temperature=0.7,
                max_tokens=1000,
            )
            return response.content
        except Exception as e:
            logger.error(f"Failed to generate AI response: {e}")
            raise ValueError("Failed to generate interview response")

    def get_chat_history(self, db: Session, assessment_id: int) -> List[Message]:
        """Get chat history for an assessment."""
        return (
            db.query(Message)
            .filter(Message.assessment_id == assessment_id)
            .order_by(Message.created_at)
            .all()
        )

    def get_last_ai_message(self, db: Session, assessment_id: int) -> Optional[Message]:
        """Get the last message sent by AI."""
        return (
            db.query(Message)
            .filter(
                Message.assessment_id == assessment_id,
                Message.sender == ChatSender.AI,
            )
            .order_by(Message.created_at.desc())
            .first()
        )


interviewer_service = InterviewerService()
