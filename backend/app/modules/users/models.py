"""User SQLAlchemy model."""

from sqlalchemy import Boolean, Column, String

from app.shared.base_model import Base, TimestampMixin, UUIDMixin


class User(UUIDMixin, TimestampMixin, Base):
    """User model with UUID primary key."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # OAuth provider info
    provider = Column(
        String(50), default="email", nullable=False
    )  # email, google, github
    provider_id = Column(String(255), nullable=True)

    # Relationships defined via backref in other models
