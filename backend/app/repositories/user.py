"""Repository for users."""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository
from app.schemas.user import UserCreate, UserUpdate


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    """Repository for user operations."""

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Get a user by email."""
        return db.query(User).filter(User.email == email).first()

    def get_by_provider_id(
        self, db: Session, *, provider: str, provider_id: str
    ) -> Optional[User]:
        """Get a user by OAuth provider and provider ID."""
        return (
            db.query(User)
            .filter(User.provider == provider, User.provider_id == provider_id)
            .first()
        )

    def is_active(self, db: Session, *, user: User) -> bool:
        """Check if a user is active."""
        return user.is_active


# Singleton instance
user_repository = UserRepository()
