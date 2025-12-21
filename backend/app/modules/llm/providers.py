"""
Google Gemini LLM Provider with streaming and memory support.

This module provides the Google Gemini API integration with:
- Synchronous and streaming generation
- Conversation memory management
- Structured output support
- Cost calculation
"""

import logging
import time
from typing import Any, AsyncIterator

from app.modules.llm.schemas import (
    ConversationMemory,
    LLMResponse,
    ModelCapability,
    ModelConfig,
    StreamChunk,
)

logger = logging.getLogger(__name__)


class GoogleGeminiProvider:
    """
    Google Gemini API provider with streaming and memory support.

    Follows Google GenAI SDK best practices for async operations
    and proper resource management.
    """

    # Model pricing per million tokens (as of Dec 2024)
    PRICING = {
        "gemini-2.0-flash-exp": {"input": 0.0, "output": 0.0},  # Free tier
        "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
        "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
        "gemini-2.5-flash-preview": {"input": 0.15, "output": 0.60},
        "gemini-3-flash-preview": {"input": 0.15, "output": 0.60},
    }

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash-exp"):
        """
        Initialize the Gemini provider.

        Args:
            api_key: Google API key
            model: Model name to use
        """
        self.api_key = api_key
        self.model = model
        self._client = None

    @property
    def client(self):
        """Lazily initialize the genai client."""
        if self._client is None:
            from google import genai

            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def get_model_config(self) -> ModelConfig:
        """Get configuration for the current model."""
        pricing = self.PRICING.get(
            self.model,
            {"input": 0.15, "output": 0.60},  # Default pricing
        )
        return ModelConfig(
            name=self.model,
            input_price_per_million=pricing["input"],
            output_price_per_million=pricing["output"],
            context_window=1000000,  # Gemini 2.0 supports 1M tokens
            max_output_tokens=8192,
            capabilities=[
                ModelCapability.TEXT_GENERATION,
                ModelCapability.CODE_GENERATION,
                ModelCapability.STRUCTURED_OUTPUT,
                ModelCapability.FUNCTION_CALLING,
                ModelCapability.WEB_SEARCH,
                ModelCapability.STREAMING,
            ],
        )

    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost in USD for token usage."""
        pricing = self.PRICING.get(self.model, {"input": 0.15, "output": 0.60})
        return (input_tokens * pricing["input"] / 1_000_000) + (
            output_tokens * pricing["output"] / 1_000_000
        )

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        json_mode: bool = False,
        response_schema: Any = None,
        enable_web_search: bool = False,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a response using Google Gemini API.

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            json_mode: Whether to enforce JSON output
            response_schema: Pydantic model for structured output
            enable_web_search: Enable Google Search grounding

        Returns:
            LLMResponse with generated content and metadata
        """
        try:
            from google.genai import types
        except ImportError:
            raise ImportError(
                "google-genai package is required. Install with: pip install google-genai"
            )

        start_time = time.time()

        try:
            # Build the content
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=user_prompt)],
                ),
            ]

            # Configure generation
            config_params = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "system_instruction": [types.Part.from_text(text=system_prompt)],
            }

            # Add JSON mode if requested
            if json_mode:
                config_params["response_mime_type"] = "application/json"
                if response_schema:
                    config_params["response_schema"] = response_schema

            # Add tools if needed
            tools = []
            if enable_web_search:
                tools.append(types.Tool(google_search=types.GoogleSearch()))

            if tools:
                config_params["tools"] = tools

            generate_content_config = types.GenerateContentConfig(**config_params)

            # Generate response
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            )

            latency_ms = int((time.time() - start_time) * 1000)

            # Extract content
            if not response.text and not response.candidates:
                content = ""
                logger.error(f"Gemini returned empty response: {response}")
            else:
                content = response.text

            # Extract token usage
            usage = response.usage_metadata
            input_tokens = usage.prompt_token_count if usage else 0
            output_tokens = usage.candidates_token_count if usage else 0

            cost_usd = self.calculate_cost(input_tokens, output_tokens)

            metadata = {
                "finish_reason": response.candidates[0].finish_reason.name
                if response.candidates
                else None,
            }

            return LLMResponse(
                content=content,
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                cost_usd=cost_usd,
                metadata=metadata,
            )

        except Exception as e:
            logger.error(f"Google Gemini API error: {e}")
            raise

    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        **kwargs,
    ) -> AsyncIterator[StreamChunk]:
        """
        Stream response chunks from Google Gemini API.

        Yields StreamChunk objects as they arrive from the API.

        Args:
            system_prompt: System-level instructions
            user_prompt: User's input prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Yields:
            StreamChunk objects with incremental content
        """
        try:
            from google.genai import types
        except ImportError:
            raise ImportError(
                "google-genai package is required. Install with: pip install google-genai"
            )

        try:
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=user_prompt)],
                ),
            ]

            config_params = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "system_instruction": [types.Part.from_text(text=system_prompt)],
            }

            generate_content_config = types.GenerateContentConfig(**config_params)

            # Use streaming endpoint
            response_stream = self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            )

            chunk_index = 0
            for chunk in response_stream:
                if chunk.text:
                    is_final = False
                    finish_reason = None

                    # Check for finish reason
                    if chunk.candidates and chunk.candidates[0].finish_reason:
                        is_final = True
                        finish_reason = chunk.candidates[0].finish_reason.name

                    yield StreamChunk(
                        content=chunk.text,
                        chunk_index=chunk_index,
                        is_final=is_final,
                        finish_reason=finish_reason,
                    )
                    chunk_index += 1

            # Ensure we yield a final chunk if not already done
            if chunk_index > 0:
                yield StreamChunk(
                    content="",
                    chunk_index=chunk_index,
                    is_final=True,
                    finish_reason="STOP",
                )

        except Exception as e:
            logger.error(f"Gemini streaming error: {e}")
            raise

    async def generate_with_memory(
        self,
        memory: ConversationMemory,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        json_mode: bool = False,
        response_schema: Any = None,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a response using conversation history for context.

        Args:
            memory: ConversationMemory with history
            user_message: Latest user message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            json_mode: Whether to enforce JSON output
            response_schema: Pydantic model for structured output

        Returns:
            LLMResponse with generated content and metadata
        """
        try:
            from google.genai import types
        except ImportError:
            raise ImportError(
                "google-genai package is required. Install with: pip install google-genai"
            )

        start_time = time.time()

        try:
            # Build contents from memory history
            contents = []
            for msg in memory.get_history_for_genai():
                contents.append(
                    types.Content(
                        role=msg["role"],
                        parts=[types.Part.from_text(text=msg["parts"][0]["text"])],
                    )
                )

            # Add the new user message
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=user_message)],
                )
            )

            # Configure generation
            config_params = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }

            # Add system instruction from memory
            if memory.system_instruction:
                config_params["system_instruction"] = [
                    types.Part.from_text(text=memory.system_instruction)
                ]

            # Add JSON mode if requested
            if json_mode:
                config_params["response_mime_type"] = "application/json"
                if response_schema:
                    config_params["response_schema"] = response_schema

            generate_content_config = types.GenerateContentConfig(**config_params)

            # Generate response
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            )

            latency_ms = int((time.time() - start_time) * 1000)

            # Extract content
            content = response.text if response.text else ""

            # Extract token usage
            usage = response.usage_metadata
            input_tokens = usage.prompt_token_count if usage else 0
            output_tokens = usage.candidates_token_count if usage else 0

            cost_usd = self.calculate_cost(input_tokens, output_tokens)

            metadata = {
                "finish_reason": response.candidates[0].finish_reason.name
                if response.candidates
                else None,
                "history_length": len(memory),
            }

            return LLMResponse(
                content=content,
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                cost_usd=cost_usd,
                metadata=metadata,
                conversation_id=memory.conversation_id,
            )

        except Exception as e:
            logger.error(f"Google Gemini API error with memory: {e}")
            raise

    async def generate_stream_with_memory(
        self,
        memory: ConversationMemory,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 8192,
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
            from google.genai import types
        except ImportError:
            raise ImportError(
                "google-genai package is required. Install with: pip install google-genai"
            )

        try:
            # Build contents from memory history
            contents = []
            for msg in memory.get_history_for_genai():
                contents.append(
                    types.Content(
                        role=msg["role"],
                        parts=[types.Part.from_text(text=msg["parts"][0]["text"])],
                    )
                )

            # Add the new user message
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=user_message)],
                )
            )

            # Configure generation
            config_params = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }

            if memory.system_instruction:
                config_params["system_instruction"] = [
                    types.Part.from_text(text=memory.system_instruction)
                ]

            generate_content_config = types.GenerateContentConfig(**config_params)

            # Use streaming endpoint
            response_stream = self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            )

            chunk_index = 0
            for chunk in response_stream:
                if chunk.text:
                    is_final = False
                    finish_reason = None

                    if chunk.candidates and chunk.candidates[0].finish_reason:
                        is_final = True
                        finish_reason = chunk.candidates[0].finish_reason.name

                    yield StreamChunk(
                        content=chunk.text,
                        chunk_index=chunk_index,
                        is_final=is_final,
                        finish_reason=finish_reason,
                        metadata={"conversation_id": memory.conversation_id},
                    )
                    chunk_index += 1

            # Final chunk
            if chunk_index > 0:
                yield StreamChunk(
                    content="",
                    chunk_index=chunk_index,
                    is_final=True,
                    finish_reason="STOP",
                    metadata={"conversation_id": memory.conversation_id},
                )

        except Exception as e:
            logger.error(f"Gemini streaming error with memory: {e}")
            raise
