"""Unit tests for transcription service."""

import pytest

from app.services.transcription import (
    TranscriptionService,
    TranscriptionResult,
    MockTranscriptionProvider,
)


class TestTranscriptionResult:
    """Tests for TranscriptionResult."""

    def test_result_initialization(self):
        """Test result initialization with all fields."""
        result = TranscriptionResult(
            text="Test transcription",
            confidence=0.95,
            duration_ms=1500,
            provider="test",
        )

        assert result.text == "Test transcription"
        assert result.confidence == 0.95
        assert result.duration_ms == 1500
        assert result.provider == "test"

    def test_result_with_defaults(self):
        """Test result initialization with defaults."""
        result = TranscriptionResult(text="Test")

        assert result.text == "Test"
        assert result.confidence is None
        assert result.duration_ms == 0
        assert result.provider == "unknown"


class TestMockTranscriptionProvider:
    """Tests for MockTranscriptionProvider."""

    @pytest.mark.asyncio
    async def test_transcribe_url(self):
        """Test transcribing from URL."""
        provider = MockTranscriptionProvider()

        result = await provider.transcribe("https://example.com/audio.wav")

        assert isinstance(result, TranscriptionResult)
        assert result.text
        assert result.provider == "mock"
        assert result.duration_ms > 0

    @pytest.mark.asyncio
    async def test_transcribe_bytes(self):
        """Test transcribing from bytes."""
        provider = MockTranscriptionProvider()

        result = await provider.transcribe_bytes(b"fake audio data", "wav")

        assert isinstance(result, TranscriptionResult)
        assert result.text
        assert result.provider == "mock"


class TestTranscriptionService:
    """Tests for TranscriptionService."""

    def test_service_initialization_with_provider(self):
        """Test service initializes with provided provider."""
        provider = MockTranscriptionProvider()
        service = TranscriptionService(provider=provider)

        assert service.provider == provider

    @pytest.mark.asyncio
    async def test_transcribe_audio_url(self):
        """Test transcribing audio from URL."""
        provider = MockTranscriptionProvider()
        service = TranscriptionService(provider=provider)

        result = await service.transcribe_audio("https://example.com/audio.wav")

        assert isinstance(result, TranscriptionResult)
        assert result.text

    @pytest.mark.asyncio
    async def test_transcribe_audio_bytes(self):
        """Test transcribing audio from bytes."""
        provider = MockTranscriptionProvider()
        service = TranscriptionService(provider=provider)

        result = await service.transcribe_audio_bytes(b"audio data", "mp3")

        assert isinstance(result, TranscriptionResult)
        assert result.text
