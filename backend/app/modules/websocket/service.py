import logging
from typing import List

from sqlalchemy.orm import Session

from app.core.dependencies import get_llm_service
from app.modules.assessments.models import Assessment
from app.modules.websocket.models import ChatSender, Message

logger = logging.getLogger(__name__)


class InterviewerService:
    def get_welcome_message(self, assessment: Assessment) -> str:
        """Return a welcome message based on the assessment context."""
        return f"Welcome to your interview practice for {assessment.title}. I'm your AI interviewer. Ready to begin?"

    def get_initial_question(self, assessment: Assessment) -> str:
        """Return the initial question."""
        return "Let's start with a simple question: Can you tell me a little bit about yourself and your background?"

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

    async def generate_ai_response(
        self,
        db: Session,
        assessment: Assessment,
        user_message: str,
        history: List[Message],
    ) -> str:
        """Generate a response from the AI interviewer."""
        llm_service = get_llm_service()

        # Format history for prompt
        context = self._format_history(history)
        context_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in context])
        full_user_prompt = f"Context:\n{context_str}\n\nUser: {user_message}"

        system_prompt = f"You are an expert interviewer conducting an interview for {assessment.title}."

        llm_response = await llm_service.generate(
            system_prompt=system_prompt,
            user_prompt=full_user_prompt,
            temperature=0.7,
            max_tokens=500,
        )

        return llm_response.content

    def _format_history(self, history: List[Message]) -> list:
        """Format history for LLM consumption."""
        formatted = []
        for msg in history:
            role = "assistant" if msg.sender == ChatSender.AI else "user"
            formatted.append({"role": role, "content": msg.content})
        return formatted


interviewer_service = InterviewerService()
