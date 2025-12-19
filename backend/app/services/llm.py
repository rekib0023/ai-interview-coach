"""LLM service for feedback and practice generation."""

import json
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.crud import feedback as feedback_crud
from app.crud import practice as practice_crud
from app.models.assessment import Assessment
from app.models.feedback import FeedbackRun
from app.models.practice import PracticeDifficulty, PracticeType
from app.schemas.practice import PracticeCreate
from app.services.prompts import (
    FEEDBACK_PROMPT_VERSION,
    generate_prompt_id,
    get_feedback_system_prompt,
    get_feedback_user_prompt,
    get_practice_generation_prompt,
    get_practice_system_prompt,
)
from app.services.transcription import TranscriptionService

logger = logging.getLogger(__name__)


@dataclass
class LLMResponse:
    """Response from LLM provider."""

    content: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    cost_usd: float


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> LLMResponse:
        """Generate a response from the LLM."""
        pass


class MockLLMProvider(LLMProvider):
    """Mock LLM provider for testing."""

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> LLMResponse:
        """Generate a mock response."""
        import asyncio

        await asyncio.sleep(0.5)  # Simulate API latency

        # Check if this is a feedback or practice request
        if "evaluate" in user_prompt.lower() and "overall_score" in user_prompt.lower():
            content = json.dumps(
                {
                    "overall_score": 78,
                    "criterion_scores": {
                        "clarity": 80,
                        "technical_accuracy": 75,
                        "problem_solving": 78,
                        "communication": 80,
                    },
                    "strengths": [
                        "Clear articulation of the problem-solving approach",
                        "Good use of examples to illustrate points",
                        "Demonstrated understanding of core concepts",
                    ],
                    "weaknesses": [
                        "Could provide more detail on edge cases",
                        "Time complexity analysis was incomplete",
                        "Did not discuss alternative approaches",
                    ],
                    "suggestions": [
                        "Practice analyzing time and space complexity for all solutions",
                        "Consider edge cases early in your problem-solving process",
                        "Discuss trade-offs between different approaches",
                    ],
                    "detailed_feedback": "## Overall Assessment\n\nYour response demonstrated a solid understanding of the problem and a methodical approach to solving it. You clearly explained your thought process, which is excellent for interview settings.\n\n### Strengths\n- Your step-by-step breakdown was easy to follow\n- Good communication throughout\n\n### Areas for Improvement\n- Spend more time on complexity analysis\n- Consider edge cases more thoroughly\n\n### Next Steps\nFocus on practicing time complexity analysis and edge case handling in your upcoming practice sessions.",
                }
            )
        else:
            content = json.dumps(
                {
                    "practices": [
                        {
                            "title": "Time Complexity Analysis Practice",
                            "prompt": "Analyze the time complexity of the following sorting algorithm and explain your reasoning step by step.",
                            "practice_type": "practice_question",
                            "difficulty": "medium",
                            "target_weakness": "Time complexity analysis was incomplete",
                            "target_skill": "Algorithm Analysis",
                            "expected_answer": "The algorithm has O(n log n) time complexity due to the divide-and-conquer approach.",
                            "hints": "Consider how many times the input is divided and how much work is done at each level.",
                        },
                        {
                            "title": "Edge Case Identification",
                            "prompt": "List all edge cases you should consider when implementing a binary search algorithm.",
                            "practice_type": "concept_review",
                            "difficulty": "easy",
                            "target_weakness": "Could provide more detail on edge cases",
                            "target_skill": "Problem Analysis",
                            "expected_answer": "Empty array, single element, target not found, duplicate elements, very large arrays.",
                            "hints": "Think about what could make the algorithm fail or behave unexpectedly.",
                        },
                        {
                            "title": "Alternative Approaches Discussion",
                            "prompt": "Describe three different approaches to solve a two-sum problem and discuss the trade-offs of each.",
                            "practice_type": "mock_scenario",
                            "difficulty": "hard",
                            "target_weakness": "Did not discuss alternative approaches",
                            "target_skill": "Problem Solving",
                            "expected_answer": "Brute force O(n²), sorting + two pointers O(n log n), hash map O(n). Trade-offs involve time vs space complexity.",
                            "hints": "Consider brute force, then think about how data structures can optimize the solution.",
                        },
                    ]
                }
            )

        return LLMResponse(
            content=content,
            model="mock-gpt-4",
            input_tokens=500,
            output_tokens=800,
            latency_ms=500,
            cost_usd=0.02,
        )


class OpenAIProvider(LLMProvider):
    """OpenAI API provider."""

    # Pricing per 1M tokens (as of late 2024)
    PRICING = {
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "gpt-4-turbo": {"input": 10.00, "output": 30.00},
        "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    }

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> LLMResponse:
        """Generate a response using OpenAI API."""
        import httpx

        start_time = time.time()

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                    timeout=60.0,
                )
                response.raise_for_status()
                data = response.json()

            latency_ms = int((time.time() - start_time) * 1000)

            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)

            # Calculate cost
            pricing = self.PRICING.get(self.model, {"input": 0, "output": 0})
            cost_usd = (input_tokens / 1_000_000) * pricing["input"] + (
                output_tokens / 1_000_000
            ) * pricing["output"]

            return LLMResponse(
                content=content,
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                cost_usd=cost_usd,
            )

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API provider."""

    # Pricing per 1M tokens
    PRICING = {
        "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
        "claude-3-5-haiku-20241022": {"input": 1.00, "output": 5.00},
        "claude-3-opus-20240229": {"input": 15.00, "output": 75.00},
    }

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key
        self.model = model

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> LLMResponse:
        """Generate a response using Anthropic API."""
        import httpx

        start_time = time.time()

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "max_tokens": max_tokens,
                        "system": system_prompt,
                        "messages": [
                            {"role": "user", "content": user_prompt},
                        ],
                    },
                    timeout=60.0,
                )
                response.raise_for_status()
                data = response.json()

            latency_ms = int((time.time() - start_time) * 1000)

            content = data["content"][0]["text"]
            usage = data.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)

            # Calculate cost
            pricing = self.PRICING.get(self.model, {"input": 0, "output": 0})
            cost_usd = (input_tokens / 1_000_000) * pricing["input"] + (
                output_tokens / 1_000_000
            ) * pricing["output"]

            return LLMResponse(
                content=content,
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                cost_usd=cost_usd,
            )

        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise


class LLMService:
    """Service for LLM-based feedback and practice generation."""

    def __init__(self, provider: Optional[LLMProvider] = None):
        self._provider = provider
        self._transcription_service = TranscriptionService()

    @property
    def provider(self) -> LLMProvider:
        """Get the LLM provider, initializing if needed."""
        if self._provider is None:
            from app.core.config import settings

            if settings.LLM_PROVIDER == "openai":
                if not settings.OPENAI_API_KEY:
                    logger.warning("OpenAI API key not configured, using mock provider")
                    self._provider = MockLLMProvider()
                else:
                    self._provider = OpenAIProvider(
                        api_key=settings.OPENAI_API_KEY,
                        model=settings.LLM_MODEL or "gpt-4o-mini",
                    )
            elif settings.LLM_PROVIDER == "anthropic":
                if not settings.ANTHROPIC_API_KEY:
                    logger.warning(
                        "Anthropic API key not configured, using mock provider"
                    )
                    self._provider = MockLLMProvider()
                else:
                    self._provider = AnthropicProvider(
                        api_key=settings.ANTHROPIC_API_KEY,
                        model=settings.LLM_MODEL or "claude-3-5-sonnet-20241022",
                    )
            else:
                self._provider = MockLLMProvider()

        return self._provider

    async def generate_feedback(
        self,
        db: Session,
        feedback_run: FeedbackRun,
        session: Assessment,
    ) -> FeedbackRun:
        """Generate feedback for an assessment."""
        logger.info(f"Generating feedback for assessment {session.id}")

        # Mark as processing
        feedback_run = feedback_crud.start_feedback_run(db=db, db_feedback=feedback_run)

        try:
            # Get response text (transcribe if needed)
            response_text = session.response_text
            if not response_text and session.response_audio_url:
                logger.info("Transcribing audio response")
                result = await self._transcription_service.transcribe_audio(
                    session.response_audio_url
                )
                response_text = result.text

                # Save transcript to session
                session.transcript = response_text
                session.transcript_status = "completed"
                db.commit()

            if not response_text:
                raise ValueError("No response text available for feedback")

            # Get question
            question = session.question or f"Interview question about {session.topic}"

            # Get rubric criteria if available
            rubric_criteria = None
            if feedback_run.rubric:
                rubric_criteria = feedback_run.rubric.criteria

            # Generate prompt
            prompt_id = generate_prompt_id("feedback", FEEDBACK_PROMPT_VERSION)
            system_prompt = get_feedback_system_prompt()
            user_prompt = get_feedback_user_prompt(
                question=question,
                response_text=response_text,
                topic=session.topic,
                difficulty=session.difficulty.value,
                role=session.role,
                skill_targets=session.skill_targets,
                rubric_criteria=rubric_criteria,
            )

            # Call LLM
            llm_response = await self.provider.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.5,
                max_tokens=2000,
            )

            # Parse response
            feedback_data = self._parse_feedback_response(llm_response.content)

            # Update feedback run with results
            feedback_run = feedback_crud.complete_feedback_run(
                db=db,
                db_feedback=feedback_run,
                overall_score=feedback_data["overall_score"],
                criterion_scores=feedback_data.get("criterion_scores"),
                strengths=feedback_data.get("strengths"),
                weaknesses=feedback_data.get("weaknesses"),
                suggestions=feedback_data.get("suggestions"),
                detailed_feedback=feedback_data.get("detailed_feedback"),
                model_name=llm_response.model,
                prompt_id=prompt_id,
                prompt_template_version=FEEDBACK_PROMPT_VERSION,
                latency_ms=llm_response.latency_ms,
                input_tokens=llm_response.input_tokens,
                output_tokens=llm_response.output_tokens,
                total_cost_usd=llm_response.cost_usd,
            )

            logger.info(
                f"Feedback generated for assessment {session.id}: "
                f"score={feedback_data['overall_score']}, "
                f"latency={llm_response.latency_ms}ms, "
                f"cost=${llm_response.cost_usd:.4f}"
            )

            return feedback_run

        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            feedback_run = feedback_crud.fail_feedback_run(
                db=db,
                db_feedback=feedback_run,
                error_message=str(e),
            )
            raise

    async def generate_practices(
        self,
        db: Session,
        feedback_run: FeedbackRun,
        user_id: int,
        count: int = 3,
        difficulty_ramp: bool = False,
    ) -> list:
        """Generate practice exercises based on feedback."""
        logger.info(f"Generating {count} practices for feedback {feedback_run.id}")

        try:
            # Get weaknesses from feedback
            weaknesses = feedback_run.weaknesses or []
            if not weaknesses:
                logger.warning("No weaknesses identified, generating general practices")
                weaknesses = ["General practice needed"]

            # Get assessment info
            assessment = feedback_run.assessment

            # Generate prompt
            system_prompt = get_practice_system_prompt()
            user_prompt = get_practice_generation_prompt(
                weaknesses=weaknesses,
                topic=assessment.topic,
                count=count,
                difficulty_ramp=difficulty_ramp,
                skill_targets=assessment.skill_targets,
            )

            # Call LLM
            llm_response = await self.provider.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=2000,
            )

            # Parse response
            practices_data = self._parse_practices_response(llm_response.content)

            # Create practice records
            practice_creates = []
            for i, practice_data in enumerate(practices_data["practices"]):
                practice_type = self._parse_practice_type(
                    practice_data.get("practice_type", "practice_question")
                )
                difficulty = self._parse_practice_difficulty(
                    practice_data.get("difficulty", "medium")
                )

                practice_create = PracticeCreate(
                    feedback_run_id=feedback_run.id,
                    title=practice_data["title"],
                    prompt=practice_data["prompt"],
                    practice_type=practice_type,
                    difficulty=difficulty,
                    target_weakness=practice_data.get("target_weakness"),
                    target_skill=practice_data.get("target_skill"),
                    expected_answer=practice_data.get("expected_answer"),
                    hints=practice_data.get("hints"),
                    sequence_order=i,
                )
                practice_creates.append(practice_create)

            # Batch create practices
            practices = practice_crud.create_practices_batch(
                db=db, user_id=user_id, practices_in=practice_creates
            )

            logger.info(
                f"Generated {len(practices)} practices for feedback {feedback_run.id}, "
                f"latency={llm_response.latency_ms}ms, "
                f"cost=${llm_response.cost_usd:.4f}"
            )

            return practices

        except Exception as e:
            logger.error(f"Error generating practices: {e}")
            raise

    def _parse_feedback_response(self, content: str) -> dict[str, Any]:
        """Parse feedback response from LLM."""
        try:
            # Try to extract JSON from response
            content = content.strip()

            # Handle markdown code blocks
            if content.startswith("```"):
                lines = content.split("\n")
                # Remove first and last lines (```json and ```)
                content = "\n".join(lines[1:-1])

            data = json.loads(content)

            # Validate required fields
            if "overall_score" not in data:
                raise ValueError("Missing overall_score in response")

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse feedback response: {e}")
            logger.error(f"Response content: {content[:500]}...")
            raise ValueError(f"Invalid JSON in LLM response: {e}")

    def _parse_practices_response(self, content: str) -> dict[str, Any]:
        """Parse practices response from LLM."""
        try:
            content = content.strip()

            # Handle markdown code blocks
            if content.startswith("```"):
                lines = content.split("\n")
                content = "\n".join(lines[1:-1])

            data = json.loads(content)

            if "practices" not in data:
                raise ValueError("Missing practices in response")

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse drills response: {e}")
            raise ValueError(f"Invalid JSON in LLM response: {e}")

    def _parse_practice_type(self, practice_type_str: str) -> PracticeType:
        """Parse practice type string to enum."""
        mapping = {
            "practice_question": PracticeType.PRACTICE_QUESTION,
            "code_exercise": PracticeType.CODE_EXERCISE,
            "concept_review": PracticeType.CONCEPT_REVIEW,
            "mock_scenario": PracticeType.MOCK_SCENARIO,
        }
        return mapping.get(practice_type_str.lower(), PracticeType.PRACTICE_QUESTION)

    def _parse_practice_difficulty(self, difficulty_str: str) -> PracticeDifficulty:
        """Parse practice difficulty string to enum."""
        mapping = {
            "easy": PracticeDifficulty.EASY,
            "medium": PracticeDifficulty.MEDIUM,
            "hard": PracticeDifficulty.HARD,
        }
        return mapping.get(difficulty_str.lower(), PracticeDifficulty.MEDIUM)


llm_service = LLMService()
