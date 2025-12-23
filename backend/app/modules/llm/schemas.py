from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

# =============================================================================
# Streaming Types
# =============================================================================


@dataclass
class StreamChunk:
    """Represents a single chunk in a streaming response."""

    content: str
    chunk_index: int
    is_final: bool = False
    finish_reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# =============================================================================
# Conversation Memory Types
# =============================================================================


# class ConversationRole(str, Enum):
#     """Role in a conversation turn."""

#     USER = "user"
#     MODEL = "model"
#     SYSTEM = "system"


# class ConversationMessage(BaseModel):
#     """A single message in conversation history."""

#     role: ConversationRole
#     content: str
#     timestamp: Optional[datetime] = None

#     class Config:
#         use_enum_values = True


# class ConversationMemory(BaseModel):
#     """
#     Manages conversation history for context-aware LLM generation.

#     Provides automatic truncation based on message count and supports
#     conversion to Google GenAI Content format.
#     """

#     messages: List[ConversationMessage] = Field(default_factory=list)
#     system_instruction: Optional[str] = None
#     max_messages: int = Field(default=50, description="Maximum messages to retain")
#     conversation_id: Optional[str] = None

#     def add_message(self, role: ConversationRole, content: str) -> None:
#         """Add a message and enforce max_messages limit."""
#         self.messages.append(
#             ConversationMessage(
#                 role=role,
#                 content=content,
#                 timestamp=datetime.utcnow(),
#             )
#         )
#         # Truncate oldest messages if exceeding limit
#         if len(self.messages) > self.max_messages:
#             self.messages = self.messages[-self.max_messages :]

#     def add_user_message(self, content: str) -> None:
#         """Convenience method to add a user message."""
#         self.add_message(ConversationRole.USER, content)

#     def add_model_message(self, content: str) -> None:
#         """Convenience method to add a model/assistant message."""
#         self.add_message(ConversationRole.MODEL, content)

#     def get_history_for_genai(self) -> List[Dict[str, Any]]:
#         """
#         Convert messages to Google GenAI Content format.

#         Returns list suitable for passing to genai.Client.models.generate_content
#         or chats.create history parameter.
#         """
#         contents = []
#         for msg in self.messages:
#             # Get role value (handle both enum and string)
#             role = msg.role.value if hasattr(msg.role, "value") else msg.role

#             # Skip system messages as they go in system_instruction
#             if role == ConversationRole.SYSTEM.value or role == "system":
#                 continue

#             contents.append(
#                 {
#                     "role": role,
#                     "parts": [{"text": msg.content}],
#                 }
#             )
#         return contents

#     def clear(self) -> None:
#         """Clear all messages from memory."""
#         self.messages = []

#     def __len__(self) -> int:
#         return len(self.messages)


# =============================================================================
# Model Capability and Configuration
# =============================================================================


class ModelCapability(Enum):
    """LLM model capabilities."""

    TEXT_GENERATION = "text_generation"
    CODE_GENERATION = "code_generation"
    STRUCTURED_OUTPUT = "structured_output"
    FUNCTION_CALLING = "function_calling"
    VISION = "vision"
    WEB_SEARCH = "web_search"
    STREAMING = "streaming"


@dataclass
class LLMResponse:
    """Response from LLM provider."""

    content: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    cost_usd: float
    metadata: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None
    thinking_content: Optional[str] = None


@dataclass
class ModelConfig:
    """Configuration for a specific model."""

    name: str
    input_price_per_million: float
    output_price_per_million: float
    context_window: int
    max_output_tokens: int
    capabilities: list[ModelCapability]


class InterviewStatus(str, Enum):
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class InterviewRating(str, Enum):
    STRONG_HIRE = "Strong Hire"
    HIRE = "Hire"
    HOLD = "Hold"
    NO_HIRE = "No Hire"


class InterviewSummary(BaseModel):
    status: InterviewStatus = Field(
        description="Current status of the interview session"
    )
    overall_rating: Optional[InterviewRating] = Field(
        None, description="Final rating (State B only)"
    )
    strengths: Optional[List[str]] = Field(
        None, description="Specific strengths with examples (State B only)"
    )
    areas_for_growth: Optional[List[str]] = Field(
        None, description="Areas for improvement with examples (State B only)"
    )


class InterviewResponse(BaseModel):
    interviewer_intro: Optional[str] = Field(
        None, description="The introductory message from the interviewer."
    )
    interview_question: Optional[str] = Field(
        None,
        description="The primary technical problem. Provide only if a new question is being asked.",
    )
    focus_areas: Optional[List[str]] = Field(
        None, description="High-level topics for the session."
    )
    feedback: Optional[str] = Field(
        None, description="Qualitative assessment of the candidate's last answer."
    )
    follow_up_question: Optional[str] = Field(
        None, description="A secondary question building upon the previous answer."
    )
    focus_skills_addressed: Optional[List[str]] = Field(
        None, description="Specific tech stack components evaluated."
    )
    interview_summary: Optional[InterviewSummary] = Field(
        None, description="Summary of the interview session."
    )
    final_remarks: Optional[str] = Field(None, description="Closing statement.")
