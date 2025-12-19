"""Service for audio transcription."""

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    """Result of audio transcription."""

    text: str
    language: str
    duration: float
    confidence: float


class TranscriptionService:
    """Service for transcribing audio files."""

    def __init__(self):
        """Initialize the transcription service."""
        from app.core.config import settings

        self.api_key = settings.OPENAI_API_KEY
        self.client = None

    def _get_client(self):
        """Get OpenAI client, initializing if needed."""
        if not self.client:
            from openai import AsyncOpenAI

            if not self.api_key:
                logger.warning(
                    "OpenAI API key not configured, using mock transcription"
                )
                return None
            self.client = AsyncOpenAI(api_key=self.api_key)
        return self.client

    async def transcribe_audio(self, audio_url: str) -> TranscriptionResult:
        """Transcribe audio from a URL."""
        try:
            client = self._get_client()
            if not client:
                # Return mock response
                return TranscriptionResult(
                    text="This is a mock transcription of the interview response. The candidate discussed their experience with Python and cloud infrastructure.",
                    language="en",
                    duration=15.5,
                    confidence=0.95,
                )

            # In a real implementation, we would download the file from the URL first
            # For now, we'll just mock it if we can't access the file
            logger.info(f"Transcribing audio from {audio_url}")

            # TODO: Implement actual file download and transcription
            # response = await client.audio.transcriptions.create(
            #     model="whisper-1",
            #     file=audio_file
            # )

            return TranscriptionResult(
                text="This is a mock transcription of the interview response. The candidate discussed their experience with Python and cloud infrastructure.",
                language="en",
                duration=15.5,
                confidence=0.95,
            )

        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise


transcription_service = TranscriptionService()
