from typing import List, Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Coach"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: str | None = None

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # Google OAuth
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None

    # GitHub OAuth
    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None

    OAUTH_REDIRECT_URI: str | None = None

    # Application URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # =========================================================================
    # LLM Provider Settings
    # =========================================================================
    LLM_PROVIDER: Literal["openai", "anthropic", "mock"] = "mock"
    LLM_MODEL: str | None = None  # e.g., "gpt-4o-mini", "claude-3-5-sonnet-20241022"

    # OpenAI
    OPENAI_API_KEY: str | None = None

    # Anthropic
    ANTHROPIC_API_KEY: str | None = None

    # =========================================================================
    # Transcription Provider Settings
    # =========================================================================
    TRANSCRIPTION_PROVIDER: Literal["openai", "mock"] = "mock"

    # =========================================================================
    # Timeout Settings (in seconds)
    # =========================================================================
    LLM_REQUEST_TIMEOUT: int = 60  # Max time for LLM API calls
    TRANSCRIPTION_TIMEOUT: int = 120  # Max time for transcription
    FEEDBACK_GENERATION_TIMEOUT: int = (
        30  # Target latency for feedback (<5s text, <12s w/ transcription)
    )

    # =========================================================================
    # Cost Caps (in USD)
    # =========================================================================
    MAX_COST_PER_FEEDBACK: float = 0.50  # Max cost for a single feedback run
    MAX_COST_PER_DRILL_SET: float = 0.20  # Max cost for generating drills
    DAILY_COST_CAP_PER_USER: float = 5.00  # Daily spending cap per user
    MONTHLY_COST_CAP_GLOBAL: float = 1000.00  # Monthly global cost cap

    # =========================================================================
    # Feature Flags
    # =========================================================================
    FEATURE_DRILL_GENERATION: bool = True  # Enable/disable drill generation
    FEATURE_AUDIO_TRANSCRIPTION: bool = True  # Enable/disable audio transcription
    FEATURE_ADVANCED_RUBRICS: bool = True  # Enable/disable custom rubrics
    FEATURE_COACHING_LOOPS: bool = True  # Enable/disable personalized coaching

    # =========================================================================
    # Rate Limiting
    # =========================================================================
    FEEDBACK_REQUESTS_PER_HOUR: int = 20  # Max feedback requests per user per hour
    DRILL_REQUESTS_PER_HOUR: int = 10  # Max drill generation requests per hour

    # =========================================================================
    # Retry Settings
    # =========================================================================
    MAX_FEEDBACK_RETRIES: int = 3  # Max retries for failed feedback
    RETRY_BACKOFF_BASE: float = 2.0  # Exponential backoff base (seconds)

    # =========================================================================
    # Quality Settings
    # =========================================================================
    MIN_RESPONSE_LENGTH: int = 50  # Minimum chars for valid response
    FEEDBACK_TEMPERATURE: float = (
        0.5  # LLM temperature for feedback (lower = more consistent)
    )
    DRILL_TEMPERATURE: float = (
        0.7  # LLM temperature for drills (higher = more creative)
    )

    # =========================================================================
    # Admin Settings
    # =========================================================================
    ADMIN_EMAILS: List[str] = []  # Emails with admin access
    LOG_PROMPTS: bool = False  # Log full prompts (disable in prod for PII)
    LOG_RESPONSES: bool = False  # Log full LLM responses

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
