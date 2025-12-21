import logging
from typing import Optional

from app.modules.llm.providers import (
    AnthropicProvider,
    LLMProvider,
    LLMResponse,
    MockLLMProvider,
    OpenAIProvider,
)

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM interactions."""

    def __init__(self, provider: Optional[LLMProvider] = None):
        self._provider = provider

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

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> LLMResponse:
        """Generate a response from the LLM."""
        return await self.provider.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )


llm_service = LLMService()
