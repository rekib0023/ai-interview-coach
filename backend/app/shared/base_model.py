"""Base SQLAlchemy model with UUID and timestamp mixins."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, declared_attr


class UUIDMixin:
    """Mixin providing UUID primary key."""

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)


class TimestampMixin:
    """Mixin providing created_at and updated_at timestamps."""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class _Base:
    """Base class with common attributes."""

    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


Base = declarative_base(cls=_Base)
