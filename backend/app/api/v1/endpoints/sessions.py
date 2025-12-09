"""Session API endpoints for interview sessions."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.api.v1.endpoints.auth import get_current_user
from app.crud import session as session_crud
from app.models.interview_session import SessionStatus
from app.models.user import User
from app.schemas.session import (
    InterviewSession,
    InterviewSessionCreate,
    InterviewSessionList,
    InterviewSessionSubmitResponse,
    InterviewSessionUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=InterviewSession,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new interview session",
    description="Create a new interview session for the authenticated user.",
)
async def create_session(
    session_in: InterviewSessionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> InterviewSession:
    """Create a new interview session."""
    logger.info(f"Creating session for user {current_user.id}: {session_in.topic}")

    db_session = session_crud.create_session(
        db=db, user_id=current_user.id, session_in=session_in
    )

    return db_session


@router.get(
    "",
    response_model=InterviewSessionList,
    summary="List interview sessions",
    description="Get a paginated list of interview sessions for the authenticated user.",
)
async def list_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[SessionStatus] = Query(None, alias="status"),
) -> InterviewSessionList:
    """Get all sessions for the current user."""
    logger.info(f"Listing sessions for user {current_user.id}")

    skip = (page - 1) * page_size
    sessions = session_crud.get_sessions_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
        status=status_filter,
    )
    total = session_crud.count_sessions_by_user(
        db=db, user_id=current_user.id, status=status_filter
    )

    return InterviewSessionList(
        sessions=sessions,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{session_id}",
    response_model=InterviewSession,
    summary="Get interview session",
    description="Get details of a specific interview session.",
)
async def get_session(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> InterviewSession:
    """Get a specific session."""
    logger.info(f"Getting session {session_id} for user {current_user.id}")

    db_session = session_crud.get_session_by_user(
        db=db, session_id=session_id, user_id=current_user.id
    )

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    return db_session


@router.patch(
    "/{session_id}",
    response_model=InterviewSession,
    summary="Update interview session",
    description="Update an existing interview session.",
)
async def update_session(
    session_id: int,
    session_in: InterviewSessionUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> InterviewSession:
    """Update a session."""
    logger.info(f"Updating session {session_id} for user {current_user.id}")

    db_session = session_crud.get_session_by_user(
        db=db, session_id=session_id, user_id=current_user.id
    )

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Don't allow updating completed or cancelled sessions
    if db_session.status in [SessionStatus.COMPLETED, SessionStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update session with status: {db_session.status}",
        )

    db_session = session_crud.update_session(
        db=db, db_session=db_session, session_in=session_in
    )

    return db_session


@router.post(
    "/{session_id}/submit",
    response_model=InterviewSession,
    summary="Submit interview response",
    description="Submit a response (text or audio) for an interview session.",
)
async def submit_response(
    session_id: int,
    response_in: InterviewSessionSubmitResponse,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> InterviewSession:
    """Submit a response to a session."""
    logger.info(f"Submitting response for session {session_id} by user {current_user.id}")

    db_session = session_crud.get_session_by_user(
        db=db, session_id=session_id, user_id=current_user.id
    )

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Validate session status
    if db_session.status not in [SessionStatus.CREATED, SessionStatus.IN_PROGRESS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit response for session with status: {db_session.status}",
        )

    # Validate that at least one response type is provided
    if not response_in.response_text and not response_in.response_audio_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either response_text or response_audio_url must be provided",
        )

    db_session = session_crud.submit_response(
        db=db, db_session=db_session, response=response_in
    )

    return db_session


@router.post(
    "/{session_id}/complete",
    response_model=InterviewSession,
    summary="Complete interview session",
    description="Mark an interview session as completed.",
)
async def complete_session(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
    score: Optional[int] = Query(None, ge=0, le=100),
) -> InterviewSession:
    """Mark a session as completed."""
    logger.info(f"Completing session {session_id} for user {current_user.id}")

    db_session = session_crud.get_session_by_user(
        db=db, session_id=session_id, user_id=current_user.id
    )

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if db_session.status == SessionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is already completed",
        )

    db_session = session_crud.complete_session(
        db=db, db_session=db_session, score=score
    )

    return db_session


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete interview session",
    description="Delete an interview session.",
)
async def delete_session(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> None:
    """Delete a session."""
    logger.info(f"Deleting session {session_id} for user {current_user.id}")

    db_session = session_crud.get_session_by_user(
        db=db, session_id=session_id, user_id=current_user.id
    )

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    session_crud.delete_session(db=db, db_session=db_session)
