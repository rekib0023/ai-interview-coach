import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass

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
        import json

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
        elif "practice" in user_prompt.lower() or "exercises" in user_prompt.lower():
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
        else:
            # Chat response
            content = "This is a mock response from the AI interviewer. I am ready to help you practice."

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
