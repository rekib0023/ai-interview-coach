from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    db: Session = Depends(deps.get_db),
    access_token: str = Cookie(None, alias="access_token"),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=schemas.AuthResponse)
def login(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Login with email and password
    """
    user = crud.user.get_user_by_email(db, email=form_data.username)
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
    response_data = schemas.AuthResponse(user=user, message="Login successful")

    # Create JSON response
    response = JSONResponse(content=response_data.model_dump())

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Ensure HTTPS in production
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
    )

    return response


@router.post("/signup", response_model=schemas.AuthResponse)
def create_user_signup(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user and automatically log them in.
    """
    user = crud.user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    # Create the user
    user = crud.user.create_user(db=db, user=user_in)

    # Generate access token for automatic login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Create response with user data using schema
    response_data = schemas.AuthResponse(
        user=user, message="Account created successfully"
    )

    # Create JSON response
    response = JSONResponse(content=response_data.model_dump())

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Ensure HTTPS in production
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
    )

    return response


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user=Depends(get_current_user)):
    """
    Get current user profile
    """
    return current_user


@router.post("/logout", response_model=schemas.LogoutResponse)
def logout():
    """
    Logout user by clearing the HTTP-only cookie
    """
    response_data = schemas.LogoutResponse(message="Successfully logged out")
    response = JSONResponse(content=response_data.model_dump())

    # Clear the access token cookie
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=0,  # Expire immediately
    )

    return response
