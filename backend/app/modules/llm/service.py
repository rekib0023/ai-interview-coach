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
from typing import Any, AsyncIterator, Optional

from app.modules.llm.providers import GoogleGeminiProvider
from app.modules.llm.schemas import (
    ConversationMemory,
    LLMResponse,
    StreamChunk,
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

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            response_schema: Pydantic model for the expected response structure
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Provider-specific parameters

        Returns:
            LLMResponse with structured JSON content
        """
        kwargs["response_schema"] = response_schema

        return await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True,
            **kwargs,
        )

    # =========================================================================
    # Streaming Generation
    # =========================================================================

    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> AsyncIterator[StreamChunk]:
        """
        Stream response chunks for real-time delivery.

        Yields StreamChunk objects as they arrive from the LLM.

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Provider-specific parameters

        Yields:
            StreamChunk objects with incremental content
        """
        try:
            async for chunk in self.provider.generate_stream(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            ):
                yield chunk

        except Exception as e:
            logger.error(f"LLM streaming error: {e}")
            raise

    async def generate_stream_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> AsyncIterator[str]:
        """
        Stream raw text chunks for simple streaming scenarios.

        This is a convenience wrapper that yields just the text content.

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Yields:
            String chunks of generated text
        """
        async for chunk in self.generate_stream(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        ):
            if chunk.content:
                yield chunk.content

    # =========================================================================
    # Memory-Aware Generation
    # =========================================================================

    async def generate_with_memory(
        self,
        memory: ConversationMemory,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        json_mode: bool = False,
        response_schema: Any = None,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a response using full conversation context.

        The memory object contains the conversation history and system
        instruction. The user_message is added to history automatically.

        Args:
            memory: ConversationMemory with history
            user_message: Latest user message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            json_mode: Whether to enforce JSON output
            response_schema: Pydantic model for structured output
            **kwargs: Provider-specific parameters

        Returns:
            LLMResponse with generated content
        """
        try:
            response = await self.provider.generate_with_memory(
                memory=memory,
                user_message=user_message,
                temperature=temperature,
                max_tokens=max_tokens,
                json_mode=json_mode,
                response_schema=response_schema,
                **kwargs,
            )

            logger.info(
                f"Memory-aware generation completed: "
                f"history_length={len(memory)}, "
                f"{response.input_tokens} input tokens, "
                f"{response.output_tokens} output tokens"
            )

            return response

        except Exception as e:
            logger.error(f"Memory-aware generation error: {e}")
            raise

    async def generate_stream_with_memory(
        self,
        memory: ConversationMemory,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs,
    ) -> AsyncIterator[StreamChunk]:
        """
        Stream response chunks using conversation history for context.

        Args:
            memory: ConversationMemory with history
            user_message: Latest user message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Yields:
            StreamChunk objects with incremental content
        """
        try:
            async for chunk in self.provider.generate_stream_with_memory(
                memory=memory,
                user_message=user_message,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            ):
                yield chunk

        except Exception as e:
            logger.error(f"Memory-aware streaming error: {e}")
            raise

    # =========================================================================
    # Utility Methods
    # =========================================================================

    def create_memory(
        self,
        system_instruction: Optional[str] = None,
        max_messages: int = 50,
        conversation_id: Optional[str] = None,
    ) -> ConversationMemory:
        """
        Create a new ConversationMemory instance.

        Convenience factory method for creating memory objects.

        Args:
            system_instruction: System-level instructions for the conversation
            max_messages: Maximum messages to retain in memory
            conversation_id: Optional ID for tracking

        Returns:
            New ConversationMemory instance
        """
        return ConversationMemory(
            system_instruction=system_instruction,
            max_messages=max_messages,
            conversation_id=conversation_id,
        )


# Global service instance
llm_service = LLMService()
