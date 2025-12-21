import logging
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.dependencies import get_llm_service
from app.modules.assessments.models import Assessment
from app.modules.llm.prompts import get_interview_system_prompt
from app.modules.llm.schemas import InterviewResponse
from app.modules.websocket.models import ChatSender, Message

logger = logging.getLogger(__name__)


class InterviewerService:
    async def generate_initial_session(
        self, assessment: Assessment
    ) -> InterviewResponse:
        """Generate the initial interaction (welcome + first question) using LLM."""
        llm_service = get_llm_service()

        system_prompt = (
            "You are an expert technical interviewer. "
            f"You are conducting a {assessment.difficulty.value} difficulty interview on {assessment.topic}. "
            "Your goal is to start the interview session. "
            "1. Provide a warm, professional introduction (interviewer_intro). "
            "2. Ask the first technical question (interview_question) to assess their knowledge. "
            "Focus on the specified skill targets if any."
        )

        try:
            response = await llm_service.generate_structured(
                system_prompt=system_prompt,
                user_prompt="start interview",
                response_schema=InterviewResponse,
                temperature=0.7,
            )
            import json

            data = json.loads(response.content)
            return InterviewResponse.model_validate(data)
        except Exception as e:
            logger.error(f"Failed to generate initial session: {e}")
            # Fallback
            return InterviewResponse(
                interviewer_intro=f"Welcome to your interview on {assessment.topic}. I'm your AI interviewer.",
                interview_question="Could you please briefly describe your background and experience with this requirement?",
            )

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
        assessment: Assessment,
        user_message: str,
        history: List[Message],
    ) -> InterviewResponse:
        """Generate a response from the AI interviewer using structured output."""
        llm_service = get_llm_service()

        # Format history for prompt
        # We might need to map 'assistant' roles to 'model' for Gemini if we were passing history directly,
        # but here we are just putting it in the user prompt for context.
        context = self._format_history(history)
        context_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in context])

        # Construct system prompt
        system_prompt = get_interview_system_prompt(
            topic=assessment.topic,
            role=assessment.role or "Software Engineer",  # Fallback if role is missing
            difficulty=assessment.difficulty.value,
            focus_skills=assessment.skill_targets or [],
        )

        full_user_prompt = (
            f"Context history:\n{context_str}\n\nUser's latest response: {user_message}"
        )

        # Generate structured response
        llm_response = await llm_service.generate_structured(
            system_prompt=system_prompt,
            user_prompt=full_user_prompt,
            response_schema=InterviewResponse,
            temperature=0.7,
            max_tokens=1000,
        )

        # Parse the JSON content into Pydantic model
        # valid json is guaranteed by generate_structured (mostly)
        import json

        try:
            data = json.loads(llm_response.content)
            return InterviewResponse.model_validate(data)
        except Exception as e:
            logger.error(
                f"Failed to parse LLM response: {e}, content: {llm_response.content}"
            )
            # Fallback for now - logic to be robust
            raise ValueError("Failed to generate valid interview response")

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

    def _format_history(self, history: List[Message]) -> list:
        """Format history for LLM consumption."""
        formatted = []
        for msg in history:
            role = "assistant" if msg.sender == ChatSender.AI else "user"
            formatted.append({"role": role, "content": msg.content})
        return formatted


interviewer_service = InterviewerService()
