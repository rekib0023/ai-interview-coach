"""Practice API endpoints for follow-up practice exercises."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, get_practice_service
from app.modules.users.models import User

from .models import PracticeStatus
from .schemas import (
    Practice,
    PracticeList,
    PracticeSubmitResponse,
    PracticeWithHints,
)
from .service import PracticeService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "",
    response_model=PracticeList,
    summary="List user practices",
    description="Get a paginated list of practices for the authenticated user.",
)
async def list_practices(
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[PracticeStatus] = Query(None, alias="status"),
) -> PracticeList:
    """List all practices for the current user."""
    logger.info(f"Listing practices for user {current_user.id}")

    practices = practice_service.get_practices_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status_filter,
    )
    total = practice_service.count_practices_by_user(
        db=db, user_id=current_user.id, status=status_filter
    )

    return PracticeList(practices=practices, total=total)


@router.get(
    "/pending",
    response_model=PracticeList,
    summary="Get pending practices",
    description="Get pending practices for the authenticated user.",
)
async def get_pending_practices(
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
) -> PracticeList:
    """Get pending practices."""
    logger.info(f"Getting pending practices for user {current_user.id}")

    practices = practice_service.get_pending_practices_by_user(
        db=db, user_id=current_user.id, limit=limit
    )

    return PracticeList(practices=practices, total=len(practices))


@router.get(
    "/{practice_id}",
    response_model=Practice,
    summary="Get practice details",
    description="Get detailed information about a specific practice.",
)
async def get_practice(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
) -> Practice:
    """Get practice details."""
    logger.info(f"Getting practice {practice_id} for user {current_user.id}")

    db_practice = practice_service.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    # Mark as delivered if not already (business logic)
    if db_practice and not db_practice.is_delivered:
        db_practice = practice_service.deliver_practice(db=db, db_practice=db_practice)

    return db_practice


@router.get(
    "/{practice_id}/hints",
    response_model=PracticeWithHints,
    summary="Get practice with hints",
    description="Get practice details including hints.",
)
async def get_practice_with_hints(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
) -> PracticeWithHints:
    """Get practice with hints."""
    logger.info(f"Getting practice {practice_id} with hints for user {current_user.id}")

    db_practice = practice_service.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    return db_practice


@router.post(
    "/{practice_id}/start",
    response_model=Practice,
    summary="Start a practice",
    description="Mark a practice as started.",
)
async def start_practice(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
) -> Practice:
    """Start a practice."""
    logger.info(f"Starting practice {practice_id} for user {current_user.id}")

    db_practice = practice_service.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    practice_service.validate_for_start(db_practice)
    db_practice = practice_service.start_practice(db=db, db_practice=db_practice)

    return db_practice


@router.post(
    "/{practice_id}/submit",
    response_model=Practice,
    summary="Submit practice response",
    description="Submit a response to a practice.",
)
async def submit_practice_response(
    practice_id: int,
    response_in: PracticeSubmitResponse,
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
) -> Practice:
    """Submit practice response."""
    logger.info(
        f"Submitting response for practice {practice_id} by user {current_user.id}"
    )

    db_practice = practice_service.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    practice_service.validate_for_submit(db_practice)
    db_practice = practice_service.submit_practice_response(
        db=db, db_practice=db_practice, response=response_in
    )

    return db_practice


@router.post(
    "/{practice_id}/complete",
    response_model=Practice,
    summary="Complete a practice",
    description="Mark a practice as completed with an optional score.",
)
async def complete_practice(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
    score: Optional[int] = Query(None, ge=0, le=100),
) -> Practice:
    """Complete a practice."""
    logger.info(f"Completing practice {practice_id} for user {current_user.id}")

    db_practice = practice_service.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    practice_service.validate_for_complete(db_practice)
    db_practice = practice_service.complete_practice(
        db=db, db_practice=db_practice, score=score
    )

    return db_practice


@router.post(
    "/{practice_id}/skip",
    response_model=Practice,
    summary="Skip a practice",
    description="Mark a practice as skipped.",
)
async def skip_practice(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    practice_service: Annotated[PracticeService, Depends(get_practice_service)],
    db: Session = Depends(get_db),
) -> Practice:
    """Skip a practice."""
    logger.info(f"Skipping practice {practice_id} for user {current_user.id}")

    db_practice = practice_service.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice not found",
        )

    if db_practice.status in [PracticeStatus.COMPLETED, PracticeStatus.SKIPPED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Practice already has status: {db_practice.status}",
        )

    db_practice = practice_service.skip_practice(db=db, db_practice=db_practice)

    return db_practice
