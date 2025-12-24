"""Database configuration and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Construct DATABASE_URL if not explicitly set (optional fallback)
SQLALCHEMY_DATABASE_URL = (
    settings.DATABASE_URL
    or f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@localhost/{settings.POSTGRES_DB}"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before use
    pool_size=5,  # Max connections in pool
    max_overflow=10,  # Extra connections beyond pool_size
    pool_recycle=3600,  # Recycle connections after 1 hour (prevents stale connections)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
