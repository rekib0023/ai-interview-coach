"""User SQLAlchemy model."""

from sqlalchemy import Boolean, Column, Integer, String

from app.shared.base_model import Base


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)

    # OAuth provider info (optional)
    provider = Column(String, default="email")  # email, google, github
    provider_id = Column(String, nullable=True)
