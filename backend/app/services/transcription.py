"""Transcription service for audio-to-text conversion."""

import logging
import time
from abc import ABC, abstractmethod
from typing import Optional

logger = logging.getLogger(__name__)


class TranscriptionResult:
    """Result from transcription service."""

    def __init__(
        self,
        text: str,
        confidence: Optional[float] = None,
        duration_ms: int = 0,
        provider: str = "unknown",
    ):
        self.text = text
        self.confidence = confidence
        self.duration_ms = duration_ms
        self.provider = provider


class TranscriptionProvider(ABC):
    """Abstract base class for transcription providers."""

    @abstractmethod
    async def transcribe(self, audio_url: str) -> TranscriptionResult:
        """Transcribe audio from URL to text."""
        pass

    @abstractmethod
    async def transcribe_bytes(self, audio_data: bytes, format: str) -> TranscriptionResult:
        """Transcribe audio from bytes to text."""
        pass


class MockTranscriptionProvider(TranscriptionProvider):
    """Mock transcription provider for testing."""

    async def transcribe(self, audio_url: str) -> TranscriptionResult:
        """Mock transcription from URL."""
        logger.info(f"Mock transcribing audio from: {audio_url}")
        await self._simulate_delay()

        return TranscriptionResult(
            text="This is a mock transcription of the audio response. "
                 "The candidate discussed their approach to problem solving "
                 "and demonstrated understanding of key concepts.",
            confidence=0.95,
            duration_ms=1500,
            provider="mock",
        )

    async def transcribe_bytes(self, audio_data: bytes, format: str) -> TranscriptionResult:
        """Mock transcription from bytes."""
        logger.info(f"Mock transcribing {len(audio_data)} bytes of {format} audio")
        await self._simulate_delay()

        return TranscriptionResult(
            text="This is a mock transcription of the audio response. "
                 "The candidate discussed their approach to problem solving "
                 "and demonstrated understanding of key concepts.",
            confidence=0.95,
            duration_ms=1500,
            provider="mock",
        )

    async def _simulate_delay(self):
        """Simulate processing delay."""
        import asyncio
        await asyncio.sleep(0.5)


class OpenAIWhisperProvider(TranscriptionProvider):
    """OpenAI Whisper API transcription provider."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def transcribe(self, audio_url: str) -> TranscriptionResult:
        """Transcribe audio from URL using OpenAI Whisper."""
        import httpx

        start_time = time.time()

        try:
            # Download the audio file
            async with httpx.AsyncClient() as client:
                audio_response = await client.get(audio_url)
                audio_response.raise_for_status()
                audio_data = audio_response.content

            # Transcribe the audio
            result = await self.transcribe_bytes(audio_data, "audio")
            result.duration_ms = int((time.time() - start_time) * 1000)
            return result

        except Exception as e:
            logger.error(f"Error transcribing audio from URL: {e}")
            raise

    async def transcribe_bytes(self, audio_data: bytes, format: str) -> TranscriptionResult:
        """Transcribe audio bytes using OpenAI Whisper."""
        import httpx

        start_time = time.time()

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files={"file": ("audio.wav", audio_data, "audio/wav")},
                    data={"model": "whisper-1"},
                    timeout=60.0,
                )
                response.raise_for_status()
                result_data = response.json()

            duration_ms = int((time.time() - start_time) * 1000)

            return TranscriptionResult(
                text=result_data.get("text", ""),
                confidence=None,  # Whisper doesn't provide confidence scores
                duration_ms=duration_ms,
                provider="openai-whisper",
            )

        except Exception as e:
            logger.error(f"Error transcribing audio with Whisper: {e}")
            raise


class TranscriptionService:
    """Service for managing audio transcription."""

    def __init__(self, provider: Optional[TranscriptionProvider] = None):
        self._provider = provider

    @property
    def provider(self) -> TranscriptionProvider:
        """Get the transcription provider, initializing if needed."""
        if self._provider is None:
            from app.core.config import settings

            if settings.TRANSCRIPTION_PROVIDER == "openai":
                if not settings.OPENAI_API_KEY:
                    logger.warning("OpenAI API key not configured, using mock provider")
                    self._provider = MockTranscriptionProvider()
                else:
                    self._provider = OpenAIWhisperProvider(settings.OPENAI_API_KEY)
            else:
                self._provider = MockTranscriptionProvider()

        return self._provider

    async def transcribe_audio(self, audio_url: str) -> TranscriptionResult:
        """Transcribe audio from a URL."""
        logger.info(f"Transcribing audio from: {audio_url}")

        try:
            result = await self.provider.transcribe(audio_url)
            logger.info(
                f"Transcription completed in {result.duration_ms}ms "
                f"using {result.provider}"
            )
            return result
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise

    async def transcribe_audio_bytes(
        self, audio_data: bytes, format: str = "wav"
    ) -> TranscriptionResult:
        """Transcribe audio from bytes."""
        logger.info(f"Transcribing {len(audio_data)} bytes of {format} audio")

        try:
            result = await self.provider.transcribe_bytes(audio_data, format)
            logger.info(
                f"Transcription completed in {result.duration_ms}ms "
                f"using {result.provider}"
            )
            return result
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise
