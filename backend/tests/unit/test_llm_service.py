"""Unit tests for LLM service."""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.llm import (
    LLMService,
    LLMResponse,
    MockLLMProvider,
    OpenAIProvider,
    AnthropicProvider,
)
from app.models.drill import DrillType, DrillDifficulty


class TestMockLLMProvider:
    """Tests for MockLLMProvider."""

    @pytest.mark.asyncio
    async def test_generate_feedback_response(self):
        """Test mock provider generates valid feedback response."""
        provider = MockLLMProvider()

        response = await provider.generate(
            system_prompt="You are an interview coach",
            user_prompt="Evaluate this response... overall_score",
        )

        assert isinstance(response, LLMResponse)
        assert response.model == "mock-gpt-4"
        assert response.input_tokens > 0
        assert response.output_tokens > 0

        # Parse the content as JSON
        data = json.loads(response.content)
        assert "overall_score" in data
        assert "strengths" in data
        assert "weaknesses" in data
        assert "suggestions" in data

    @pytest.mark.asyncio
    async def test_generate_drill_response(self):
        """Test mock provider generates valid drill response."""
        provider = MockLLMProvider()

        response = await provider.generate(
            system_prompt="Generate practice drills",
            user_prompt="Based on weaknesses, generate drills",
        )

        assert isinstance(response, LLMResponse)

        data = json.loads(response.content)
        assert "drills" in data
        assert len(data["drills"]) > 0


class TestLLMService:
    """Tests for LLMService."""

    def test_service_initialization_with_mock(self):
        """Test service initializes with mock provider."""
        provider = MockLLMProvider()
        service = LLMService(provider=provider)

        assert service.provider == provider

    def test_parse_feedback_response_valid(self):
        """Test parsing valid feedback response."""
        service = LLMService(provider=MockLLMProvider())

        valid_response = json.dumps({
            "overall_score": 85,
            "criterion_scores": {"accuracy": 90},
            "strengths": ["Good explanation"],
            "weaknesses": ["Missing details"],
            "suggestions": ["Add more examples"],
            "detailed_feedback": "## Summary\nGood work!",
        })

        result = service._parse_feedback_response(valid_response)

        assert result["overall_score"] == 85
        assert result["strengths"] == ["Good explanation"]

    def test_parse_feedback_response_with_markdown(self):
        """Test parsing feedback response wrapped in markdown code block."""
        service = LLMService(provider=MockLLMProvider())

        markdown_response = """```json
{
    "overall_score": 75,
    "strengths": ["Clear"],
    "weaknesses": ["Brief"],
    "suggestions": ["Expand"]
}
```"""

        result = service._parse_feedback_response(markdown_response)

        assert result["overall_score"] == 75

    def test_parse_feedback_response_missing_score(self):
        """Test parsing feedback response missing overall_score."""
        service = LLMService(provider=MockLLMProvider())

        invalid_response = json.dumps({
            "strengths": ["Good"],
            "weaknesses": ["Bad"],
        })

        with pytest.raises(ValueError, match="Missing overall_score"):
            service._parse_feedback_response(invalid_response)

    def test_parse_feedback_response_invalid_json(self):
        """Test parsing invalid JSON response."""
        service = LLMService(provider=MockLLMProvider())

        with pytest.raises(ValueError, match="Invalid JSON"):
            service._parse_feedback_response("This is not JSON")

    def test_parse_drills_response_valid(self):
        """Test parsing valid drills response."""
        service = LLMService(provider=MockLLMProvider())

        valid_response = json.dumps({
            "drills": [
                {
                    "title": "Test Drill",
                    "prompt": "Practice this",
                    "drill_type": "practice_question",
                    "difficulty": "medium",
                }
            ]
        })

        result = service._parse_drills_response(valid_response)

        assert "drills" in result
        assert len(result["drills"]) == 1

    def test_parse_drills_response_missing_drills(self):
        """Test parsing drills response without drills key."""
        service = LLMService(provider=MockLLMProvider())

        with pytest.raises(ValueError, match="Missing drills"):
            service._parse_drills_response('{"other": "data"}')

    def test_parse_drill_type(self):
        """Test drill type parsing."""
        service = LLMService(provider=MockLLMProvider())

        assert service._parse_drill_type("practice_question") == DrillType.PRACTICE_QUESTION
        assert service._parse_drill_type("code_exercise") == DrillType.CODE_EXERCISE
        assert service._parse_drill_type("concept_review") == DrillType.CONCEPT_REVIEW
        assert service._parse_drill_type("mock_scenario") == DrillType.MOCK_SCENARIO
        assert service._parse_drill_type("unknown") == DrillType.PRACTICE_QUESTION

    def test_parse_drill_difficulty(self):
        """Test drill difficulty parsing."""
        service = LLMService(provider=MockLLMProvider())

        assert service._parse_drill_difficulty("easy") == DrillDifficulty.EASY
        assert service._parse_drill_difficulty("medium") == DrillDifficulty.MEDIUM
        assert service._parse_drill_difficulty("hard") == DrillDifficulty.HARD
        assert service._parse_drill_difficulty("unknown") == DrillDifficulty.MEDIUM


class TestOpenAIProviderPricing:
    """Tests for OpenAI provider pricing calculations."""

    def test_pricing_constants_exist(self):
        """Test that pricing constants are defined."""
        assert "gpt-4o" in OpenAIProvider.PRICING
        assert "gpt-4o-mini" in OpenAIProvider.PRICING

        for model, pricing in OpenAIProvider.PRICING.items():
            assert "input" in pricing
            assert "output" in pricing
            assert pricing["input"] >= 0
            assert pricing["output"] >= 0


class TestAnthropicProviderPricing:
    """Tests for Anthropic provider pricing calculations."""

    def test_pricing_constants_exist(self):
        """Test that pricing constants are defined."""
        assert len(AnthropicProvider.PRICING) > 0

        for model, pricing in AnthropicProvider.PRICING.items():
            assert "input" in pricing
            assert "output" in pricing
            assert pricing["input"] >= 0
            assert pricing["output"] >= 0
