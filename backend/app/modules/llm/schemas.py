from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ModelCapability(Enum):
    """LLM model capabilities."""

    TEXT_GENERATION = "text_generation"
    CODE_GENERATION = "code_generation"
    STRUCTURED_OUTPUT = "structured_output"
    FUNCTION_CALLING = "function_calling"
    VISION = "vision"
    WEB_SEARCH = "web_search"


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
