"""Service for user business logic."""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.modules.users.crud import user as user_crud
from app.modules.users.schemas import UserCreate, UserUpdate
from app.shared.exceptions import NotFoundError, ValidationError


class UserService:
    """Service for user operations."""

    def __init__(self, crud=None):
        self.crud = crud or user_crud

    def create_user(self, db: Session, *, user_in: UserCreate):
        """Create a new user."""
        # Business logic: Check if user already exists
        existing_user = self.crud.get_by_email(db=db, email=user_in.email)
        if existing_user:
            raise ValidationError(f"User with email {user_in.email} already exists")

        # Hash password before creating
        user_data = user_in.model_dump()
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
        user_data["is_active"] = True
        user_data["is_superuser"] = False

        return self.crud.create(db=db, obj_in=UserCreate(**user_data))

    def get_user(self, db: Session, *, user_id: int):
        """Get a user by ID."""
        user = self.crud.get(db=db, id=user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user

    def get_user_by_email(self, db: Session, *, email: str) -> Optional:
        """Get a user by email."""
        return self.crud.get_by_email(db=db, email=email)

    def authenticate_user(self, db: Session, *, email: str, password: str):
        """Authenticate a user."""
        user = self.get_user_by_email(db=db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            raise ValidationError("User account is inactive")
        return user

    def update_user(self, db: Session, *, user_id: int, user_in: UserUpdate):
        """Update a user."""
        user = self.get_user(db=db, user_id=user_id)

        update_data = user_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(
                update_data.pop("password")
            )

        return self.crud.update(db=db, db_obj=user, obj_in=update_data)


# Singleton instance
user_service = UserService()
