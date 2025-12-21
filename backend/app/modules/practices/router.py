"""Practice API endpoints for follow-up practice exercises."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.modules.feedback import crud as feedback_crud
from app.modules.feedback.models import FeedbackStatus
from app.modules.users.models import User

from . import crud as practice_crud
from . import service as practice_service
from .models import PracticeStatus
from .schemas import (
    Practice,
    PracticeGenerateRequest,
    PracticeGenerationResult,
    PracticeList,
    PracticeSubmitResponse,
    PracticeSummary,
    PracticeWithHints,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/feedback/{feedback_id}/practices",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Generate practices from feedback",
    description="Generate follow-up practice exercises based on feedback weaknesses.",
)
async def generate_practices(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    request: Optional[PracticeGenerateRequest] = None,
) -> JSONResponse:
    """Generate practices from feedback."""
    logger.info(
        f"Generating practices for feedback {feedback_id} by user {current_user.id}"
    )

    # Verify feedback ownership and status
    db_feedback = feedback_crud.get_feedback_run_by_user(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )

    if not db_feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback run not found",
        )

    if db_feedback.status != FeedbackStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate practices until feedback is completed",
        )

    # Check if practices already exist
    existing_practices = practice_crud.get_practices_by_feedback_run(
        db=db, feedback_run_id=feedback_id
    )
    if existing_practices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Practices already generated for this feedback run",
        )

    count = request.count if request else 3
    difficulty_ramp = request.difficulty_ramp if request else False

    # Start background processing
    background_tasks.add_task(
        practice_service.generate_practices_from_feedback,
        db=db,
        feedback_run_id=feedback_id,
        user_id=current_user.id,
        count=count,
        difficulty_ramp=difficulty_ramp,
    )

    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={
            "message": "Practice generation started",
            "feedback_run_id": feedback_id,
            "requested_count": count,
            "poll_url": f"/api/v1/practices/feedback/{feedback_id}",
        },
    )


@router.get(
    "/feedback/{feedback_id}",
    response_model=PracticeGenerationResult,
    summary="Get practices for feedback",
    description="Get all practices generated for a specific feedback run.",
)
async def get_practices_for_feedback(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> PracticeGenerationResult:
    """Get practices for a feedback run."""
    logger.info(
        f"Getting practices for feedback {feedback_id} by user {current_user.id}"
    )

    # Verify feedback ownership
    db_feedback = feedback_crud.get_feedback_run_by_user(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )

    if not db_feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback run not found",
        )

    practices = practice_crud.get_practices_by_feedback_run(
        db=db, feedback_run_id=feedback_id
    )

    return PracticeGenerationResult(
        practices=practices,
        feedback_run_id=feedback_id,
        count=len(practices),
    )


@router.get(
    "",
    response_model=PracticeList,
    summary="List user practices",
    description="Get a paginated list of practices for the authenticated user.",
)
async def list_practices(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[PracticeStatus] = Query(None, alias="status"),
) -> PracticeList:
    """List all practices for the current user."""
    logger.info(f"Listing practices for user {current_user.id}")

    practices = practice_crud.get_practices_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status_filter,
    )
    total = practice_crud.count_practices_by_user(
        db=db, user_id=current_user.id, status=status_filter
    )

    summaries = [
        PracticeSummary(
            id=d.id,
            title=d.title,
            practice_type=d.practice_type,
            difficulty=d.difficulty,
            status=d.status,
            score=d.score,
        )
        for d in practices
    ]

    return PracticeList(practices=summaries, total=total)


@router.get(
    "/pending",
    response_model=PracticeList,
    summary="Get pending practices",
    description="Get pending practices for the authenticated user.",
)
async def get_pending_practices(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
) -> PracticeList:
    """Get pending practices."""
    logger.info(f"Getting pending practices for user {current_user.id}")

    practices = practice_crud.get_pending_practices_by_user(
        db=db, user_id=current_user.id, limit=limit
    )

    summaries = [
        PracticeSummary(
            id=d.id,
            title=d.title,
            practice_type=d.practice_type,
            difficulty=d.difficulty,
            status=d.status,
            score=d.score,
        )
        for d in practices
    ]

    return PracticeList(practices=summaries, total=len(practices))


@router.get(
    "/{practice_id}",
    response_model=Practice,
    summary="Get practice details",
    description="Get detailed information about a specific practice.",
)
async def get_practice(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> Practice:
    """Get practice details."""
    logger.info(f"Getting practice {practice_id} for user {current_user.id}")

    db_practice = practice_crud.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice not found",
        )

    # Mark as delivered if not already
    if not db_practice.is_delivered:
        db_practice = practice_crud.deliver_practice(db=db, db_practice=db_practice)

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
    db: Session = Depends(get_db),
) -> PracticeWithHints:
    """Get practice with hints."""
    logger.info(f"Getting practice {practice_id} with hints for user {current_user.id}")

    db_practice = practice_crud.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice not found",
        )

    return PracticeWithHints(
        id=db_practice.id,
        feedback_run_id=db_practice.feedback_run_id,
        user_id=db_practice.user_id,
        title=db_practice.title,
        prompt=db_practice.prompt,
        practice_type=db_practice.practice_type,
        difficulty=db_practice.difficulty,
        target_weakness=db_practice.target_weakness,
        target_skill=db_practice.target_skill,
        hints=db_practice.hints,
        status=db_practice.status,
        is_delivered=db_practice.is_delivered,
        delivered_at=db_practice.delivered_at,
        user_response=db_practice.user_response,
        score=db_practice.score,
        sequence_order=db_practice.sequence_order,
        created_at=db_practice.created_at,
        started_at=db_practice.started_at,
        completed_at=db_practice.completed_at,
    )


@router.post(
    "/{practice_id}/start",
    response_model=Practice,
    summary="Start a practice",
    description="Mark a practice as started.",
)
async def start_practice(
    practice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> Practice:
    """Start a practice."""
    logger.info(f"Starting practice {practice_id} for user {current_user.id}")

    db_practice = practice_crud.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice not found",
        )

    if db_practice.status not in [PracticeStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start practice with status: {db_practice.status}",
        )

    db_practice = practice_crud.start_practice(db=db, db_practice=db_practice)

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
    db: Session = Depends(get_db),
) -> Practice:
    """Submit practice response."""
    logger.info(
        f"Submitting response for practice {practice_id} by user {current_user.id}"
    )

    db_practice = practice_crud.get_practice_by_user(
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
            detail=f"Cannot submit response for practice with status: {db_practice.status}",
        )

    db_practice = practice_crud.submit_practice_response(
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
    db: Session = Depends(get_db),
    score: Optional[int] = Query(None, ge=0, le=100),
) -> Practice:
    """Complete a practice."""
    logger.info(f"Completing practice {practice_id} for user {current_user.id}")

    db_practice = practice_crud.get_practice_by_user(
        db=db, practice_id=practice_id, user_id=current_user.id
    )

    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice not found",
        )

    if db_practice.status == PracticeStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Practice is already completed",
        )

    db_practice = practice_crud.complete_practice(
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
    db: Session = Depends(get_db),
) -> Practice:
    """Skip a practice."""
    logger.info(f"Skipping practice {practice_id} for user {current_user.id}")

    db_practice = practice_crud.get_practice_by_user(
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

    db_practice = practice_crud.skip_practice(db=db, db_practice=db_practice)

    return db_practice
