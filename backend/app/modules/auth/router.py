"""Authentication router - login, signup, me, logout."""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.cookies import clear_auth_cookie, set_auth_cookie
from app.core.dependencies import get_current_user, get_db, get_user_service
from app.modules.users import AuthResponse, LogoutResponse, UserCreate
from app.modules.users.schemas import User as UserSchema
from app.modules.users.service import UserService

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
def login(
    response: Response,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service),
) -> Any:
    """
    Login with email and password
    """
    user = user_service.authenticate_user(
        db=db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Set HTTP-only cookie via shared helper
    set_auth_cookie(
        response,
        token=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # Create response with user data using schema
    return AuthResponse(user=user, message="Login successful")


@router.post("/signup", response_model=AuthResponse)
def create_user_signup(
    *,
    response: Response,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service),
) -> Any:
    """
    Create new user and automatically log them in.
    """
    # Create the user (service handles validation and hashing)
    user = user_service.create_user(db=db, user_in=user_in)

    # Generate access token for automatic login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Set HTTP-only cookie
    set_auth_cookie(
        response,
        token=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # Create response with user data using schema
    return AuthResponse(user=user, message="Account created successfully")


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user=Depends(get_current_user)):
    """
    Get current user profile
    """
    return current_user


@router.post("/logout", response_model=LogoutResponse)
def logout(response: Response):
    """
    Logout user by clearing the HTTP-only cookie
    """
    # Clear the access token cookie
    clear_auth_cookie(response)

    return LogoutResponse(message="Successfully logged out")
