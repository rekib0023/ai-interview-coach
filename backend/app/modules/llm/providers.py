import logging
import time
from typing import Any

from app.modules.llm.schemas import LLMResponse

logger = logging.getLogger(__name__)


class GoogleGeminiProvider:
    """Google Gemini API provider."""

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
        """Generate a response using Google Gemini API."""
        try:
            from google import genai
            from google.genai import types
        except ImportError:
            raise ImportError(
                "google-genai package is required. Install with: pip install google-genai"
            )

        start_time = time.time()

        try:
            client = genai.Client(api_key=self.api_key)

            # Build the content with system prompt and user prompt
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=user_prompt),
                    ],
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
            response = client.models.generate_content(
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
