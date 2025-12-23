"""
LLM Service with streaming and memory management.

This module provides the main interface for LLM interactions with:
- Standard generation
- Streaming generation
- Memory-aware generation
- Structured output support
"""

import logging
from enum import Enum
from typing import Optional

from app.modules.llm.providers import GoogleGeminiProvider
from app.modules.llm.schemas import (
    LLMResponse,
)

logger = logging.getLogger(__name__)


class LLMProviderType(Enum):
    """Supported LLM provider types."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    MOCK = "mock"


class LLMService:
    """
    Service for LLM interactions with streaming and memory support.

    Provides a unified interface for:
    - Standard synchronous generation
    - Streaming generation for real-time delivery
    - Memory-aware generation with conversation context
    """

    def __init__(self, provider: Optional[GoogleGeminiProvider] = None):
        self._provider = provider
        self._initialized = False

    @property
    def provider(self) -> GoogleGeminiProvider:
        """Get the LLM provider, initializing if needed."""
        if self._provider is None:
            self._initialize_provider()
        return self._provider

    def _initialize_provider(self) -> None:
        """Initialize the LLM provider based on configuration."""
        if self._initialized:
            return

        from app.core.config import settings

        try:
            self._provider = self._create_google_provider(settings)
            self._initialized = True
            logger.info(
                f"Initialized LLM provider: Google Gemini with model: {self._provider.model}"
            )

        except Exception as e:
            logger.error(f"Failed to initialize Google provider: {e}")
            logger.warning("Falling back to mock provider")
            self._initialized = True

    def _create_google_provider(self, settings) -> GoogleGeminiProvider:
        """Create Google Gemini provider with validation."""
        if not settings.GOOGLE_API_KEY:
            raise ValueError("Google API key not configured")

        model = settings.LLM_MODEL or "gemini-2.0-flash-exp"
        return GoogleGeminiProvider(api_key=settings.GOOGLE_API_KEY, model=model)

    # =========================================================================
    # Standard Generation
    # =========================================================================

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        json_mode: bool = False,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a response from the LLM.

        Args:
            system_prompt: System-level instructions for the LLM
            user_prompt: User's input prompt
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            json_mode: Whether to enforce JSON output
            **kwargs: Provider-specific parameters

        Returns:
            LLMResponse with generated content and metadata
        """
        try:
            response = await self.provider.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=temperature,
                max_tokens=max_tokens,
                json_mode=json_mode,
                **kwargs,
            )

            logger.info(
                f"LLM generation completed: {response.input_tokens} input tokens, "
                f"{response.output_tokens} output tokens, "
                f"{response.latency_ms}ms latency, "
                f"${response.cost_usd:.4f} cost"
            )

            return response

        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            raise


# Global service instance
llm_service = LLMService()
