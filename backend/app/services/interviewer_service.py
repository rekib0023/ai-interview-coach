"""AI Interviewer service for real-time interview conversations."""

import logging

from sqlalchemy.orm import Session

from app.models.assessment import Assessment
from app.models.message import ChatSender, Message
from app.services.llm import LLMService

logger = logging.getLogger(__name__)


class InterviewerService:
    """Service for managing AI interviewer conversations."""

    def __init__(self):
        self.llm_service = LLMService()

    def get_welcome_message(self, assessment: Assessment) -> str:
        """Generate welcome message based on assessment type."""
        topic = assessment.topic or "technical interview"
        difficulty = assessment.difficulty.value if assessment.difficulty else "Medium"

        return f"""Hello! I'm your AI interview coach. Today we'll be practicing a {difficulty.lower()} {topic} interview.

I'll ask you questions and provide guidance along the way. Take your time, think through your answers, and don't hesitate to ask for hints if you need them.

Let's begin! 🚀"""

    def get_initial_question(self, assessment: Assessment) -> str:
        """Generate the first interview question based on assessment type."""
        topic = assessment.topic.lower()
        difficulty = (
            assessment.difficulty.value.lower() if assessment.difficulty else "medium"
        )

        # Simple question templates (in production, use LLM to generate)
        questions = {
            "system design": {
                "easy": "Let's start with a simple system design question. Can you explain how a basic URL shortening service like bit.ly works?",
                "medium": "Design a system for a real-time chat application that can handle millions of concurrent users. What are the key components?",
                "hard": "Design a distributed caching system that can handle 100TB of data with sub-millisecond latency. How would you ensure consistency and handle failures?",
            },
            "coding": {
                "easy": "Let's start with a coding problem. Can you write a function to find the maximum element in an array?",
                "medium": "Implement a function to check if a binary tree is balanced. What's your approach?",
                "hard": "Design and implement an LRU (Least Recently Used) cache with O(1) time complexity for both get and put operations.",
            },
            "behavioral": {
                "easy": "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
                "medium": "Describe a challenging project you worked on. What was your role and how did you contribute to its success?",
                "hard": "Tell me about a time when you had to make a critical decision under pressure with limited information. Walk me through your thought process.",
            },
        }

        # Default to coding if topic doesn't match
        topic_key = next((k for k in questions.keys() if k in topic), "coding")
        difficulty_key = (
            difficulty if difficulty in ["easy", "medium", "hard"] else "medium"
        )

        return questions.get(topic_key, questions["coding"]).get(
            difficulty_key, questions["coding"]["medium"]
        )

    async def generate_ai_response(
        self,
        db: Session,
        assessment: Assessment,
        user_message: str,
        conversation_history: list[Message],
    ) -> str:
        """
        Generate AI interviewer response based on user message and conversation history.

        Args:
            db: Database session
            assessment: Interview assessment
            user_message: User's message
            conversation_history: Previous messages in the conversation

        Returns:
            AI response text
        """
        try:
            # Build conversation context
            context = self._build_conversation_context(
                assessment, conversation_history, user_message
            )

            # Generate response using LLM
            system_prompt = self._get_interviewer_system_prompt(assessment)
            user_prompt = self._build_user_prompt(context, user_message)

            llm_response = await self.llm_service.provider.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=500,
            )

            return llm_response.content

        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            # Fallback response
            return "I understand. Can you elaborate on that? What specific aspects would you like to discuss?"

    def _build_conversation_context(
        self,
        assessment: Assessment,
        conversation_history: list[Message],
        current_message: str,
    ) -> str:
        """Build conversation context from history."""
        context_parts = [
            f"Interview Type: {assessment.topic}",
            f"Difficulty: {assessment.difficulty.value if assessment.difficulty else 'Medium'}",
        ]

        if assessment.role:
            context_parts.append(f"Target Role: {assessment.role}")

        # Add recent conversation history (last 10 messages)
        recent_messages = (
            conversation_history[-10:]
            if len(conversation_history) > 10
            else conversation_history
        )
        if recent_messages:
            context_parts.append("\nRecent Conversation:")
            for msg in recent_messages:
                sender = "Interviewer" if msg.sender == ChatSender.AI else "Candidate"
                context_parts.append(f"{sender}: {msg.content}")

        context_parts.append(f"\nCurrent Candidate Response: {current_message}")

        return "\n".join(context_parts)

    def _get_interviewer_system_prompt(self, assessment: Assessment) -> str:
        """Get system prompt for AI interviewer."""
        topic = assessment.topic or "technical interview"
        difficulty = assessment.difficulty.value if assessment.difficulty else "Medium"

        return f"""You are an expert technical interviewer conducting a {difficulty.lower()} {topic} interview.

Your role:
- Ask thoughtful, relevant questions that assess the candidate's knowledge and problem-solving skills
- Provide helpful hints when the candidate is stuck (but don't give away the answer)
- Ask follow-up questions to probe deeper into their understanding
- Be encouraging and professional
- Adapt your questions based on the candidate's responses
- Keep responses concise (2-3 sentences max)

Interview Guidelines:
- Start with the initial question, then ask follow-ups based on their answers
- If they ask for a hint, provide a gentle nudge without revealing the solution
- If they seem stuck, ask clarifying questions to guide their thinking
- Praise good answers and gently correct misconceptions
- Maintain a conversational, friendly tone

Remember: You're helping them practice, so be supportive while still challenging them appropriately."""

    def _build_user_prompt(self, context: str, current_message: str) -> str:
        """Build user prompt for LLM."""
        return f"""Based on the following interview context and the candidate's latest response, generate your next question or comment as the interviewer.

{context}

Generate a natural, conversational response that:
1. Acknowledges their answer (if applicable)
2. Asks a follow-up question OR provides a hint OR asks them to elaborate
3. Keeps the conversation moving forward

Your response (as the interviewer):"""

    async def save_message(
        self,
        db: Session,
        assessment_id: int,
        sender: ChatSender,
        content: str,
    ) -> Message:
        """Save a message to the database."""
        message = Message(
            assessment_id=assessment_id,
            sender=sender,
            content=content,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message


# Singleton instance
interviewer_service = InterviewerService()
