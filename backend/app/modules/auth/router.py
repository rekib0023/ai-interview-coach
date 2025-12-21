"""Authentication router - login, signup, me, logout."""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.cookies import clear_auth_cookie, set_auth_cookie
from app.core.dependencies import get_current_user, get_db
from app.modules.users import AuthResponse, LogoutResponse, UserCreate, user_crud
from app.modules.users.schemas import User as UserSchema

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Login with email and password
    """
    user = user_crud.get_by_email(db, email=form_data.username)
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Create response with user data using schema
    response_data = AuthResponse(user=user, message="Login successful")

    response = JSONResponse(content=response_data.model_dump())

    # Set HTTP-only cookie via shared helper
    set_auth_cookie(
        response,
        token=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return response


@router.post("/signup", response_model=AuthResponse)
def create_user_signup(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user and automatically log them in.
    """
    user = user_crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    # Create the user
    user = user_crud.create(db=db, obj_in=user_in)

    # Generate access token for automatic login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Create response with user data using schema
    response_data = AuthResponse(user=user, message="Account created successfully")

    # Create JSON response
    response = JSONResponse(content=response_data.model_dump())

    # Set HTTP-only cookie
    set_auth_cookie(
        response,
        token=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return response


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user=Depends(get_current_user)):
    """
    Get current user profile
    """
    return current_user


@router.post("/logout", response_model=LogoutResponse)
def logout():
    """
    Logout user by clearing the HTTP-only cookie
    """
    response_data = LogoutResponse(message="Successfully logged out")
    response = JSONResponse(content=response_data.model_dump())

    # Clear the access token cookie
    clear_auth_cookie(response)

    return response
