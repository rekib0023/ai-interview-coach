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
from typing import Any

from app.modules.llm.schemas import (
    LLMResponse,
)

logger = logging.getLogger(__name__)


class GoogleGeminiProvider:
    """
    Google Gemini API provider with streaming and memory support.

    Follows Google GenAI SDK best practices for async operations
    and proper resource management.
    """

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
                metadata=metadata,
            )

        except Exception as e:
            logger.error(f"Google Gemini API error: {e}")
            raise
