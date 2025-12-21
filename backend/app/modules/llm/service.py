import logging
from enum import Enum
from typing import Any, Dict, List, Optional

from app.modules.llm.providers import (
    GoogleGeminiProvider,
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
    """Service for LLM interactions with intelligent provider management."""

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

        # Force Google Gemini as the only provider
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

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Any,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a structured JSON response with schema validation.

        This is particularly useful for Google Gemini's native structured output support.

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            response_schema: JSON schema or Pydantic model for the expected response structure
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Provider-specific parameters

        Returns:
            LLMResponse with structured JSON content
        """
        # Add schema to kwargs for Gemini
        if isinstance(self.provider, GoogleGeminiProvider):
            kwargs["response_schema"] = response_schema

        return await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True,
            **kwargs,
        )

    async def generate_with_thinking(
        self,
        system_prompt: str,
        user_prompt: str,
        thinking_level: str = "MEDIUM",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a response with thinking process (for Gemini models).

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            thinking_level: Thinking depth ("LOW", "MEDIUM", "HIGH")
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters

        Returns:
            LLMResponse with thinking process in metadata
        """
        if isinstance(self.provider, GoogleGeminiProvider):
            kwargs["thinking_level"] = thinking_level
        else:
            logger.warning(
                f"Thinking mode not supported for {type(self.provider).__name__}"
            )

        return await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )

    async def generate_with_search(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a response with web search capability (for Gemini models).

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters

        Returns:
            LLMResponse with web search results incorporated
        """
        if isinstance(self.provider, GoogleGeminiProvider):
            kwargs["enable_web_search"] = True
        else:
            logger.warning(
                f"Web search not supported for {type(self.provider).__name__}"
            )

        return await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model."""
        config = self.provider.get_model_config()
        return {
            "provider": type(self.provider).__name__,
            "model": config.name,
            "context_window": config.context_window,
            "max_output_tokens": config.max_output_tokens,
            "input_price_per_million": config.input_price_per_million,
            "output_price_per_million": config.output_price_per_million,
            "capabilities": [cap.value for cap in config.capabilities],
        }

    async def batch_generate(
        self,
        prompts: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> List[LLMResponse]:
        """
        Generate responses for multiple prompts in batch.

        Args:
            prompts: List of dicts with 'system_prompt' and 'user_prompt' keys
            temperature: Sampling temperature
            max_tokens: Maximum tokens per generation
            **kwargs: Additional parameters

        Returns:
            List of LLMResponse objects
        """
        import asyncio

        tasks = [
            self.generate(
                system_prompt=prompt["system_prompt"],
                user_prompt=prompt["user_prompt"],
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            )
            for prompt in prompts
        ]

        return await asyncio.gather(*tasks)

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Estimate cost for a given token usage.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            Estimated cost in USD
        """
        return self.provider.calculate_cost(input_tokens, output_tokens)


# Global service instance
llm_service = LLMService()
