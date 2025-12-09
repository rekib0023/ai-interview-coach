"""Drill API endpoints for follow-up practice exercises."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api import deps
from app.api.v1.endpoints.auth import get_current_user
from app.crud import drill as drill_crud
from app.crud import feedback as feedback_crud
from app.models.drill import DrillStatus
from app.models.feedback import FeedbackStatus
from app.models.user import User
from app.schemas.drill import (
    Drill,
    DrillGenerateRequest,
    DrillGenerationResult,
    DrillList,
    DrillSubmitResponse,
    DrillSummary,
    DrillWithHints,
)

logger = logging.getLogger(__name__)

router = APIRouter()


async def generate_drills_async(
    db: Session,
    feedback_run_id: int,
    user_id: int,
    count: int,
    difficulty_ramp: bool,
) -> None:
    """Background task to generate drills asynchronously."""
    from app.services.llm import LLMService

    try:
        db_feedback = feedback_crud.get_feedback_run(db=db, feedback_id=feedback_run_id)
        if not db_feedback:
            logger.error(f"Feedback run {feedback_run_id} not found")
            return

        llm_service = LLMService()
        await llm_service.generate_drills(
            db=db,
            feedback_run=db_feedback,
            user_id=user_id,
            count=count,
            difficulty_ramp=difficulty_ramp,
        )

    except Exception as e:
        logger.error(f"Error generating drills for feedback {feedback_run_id}: {e}")


@router.post(
    "/feedback/{feedback_id}/drills",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Generate drills from feedback",
    description="Generate follow-up drill exercises based on feedback weaknesses.",
)
async def generate_drills(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    request: Optional[DrillGenerateRequest] = None,
) -> JSONResponse:
    """Generate drills from feedback."""
    logger.info(
        f"Generating drills for feedback {feedback_id} by user {current_user.id}"
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
            detail="Cannot generate drills until feedback is completed",
        )

    # Check if drills already exist
    existing_drills = drill_crud.get_drills_by_feedback_run(
        db=db, feedback_run_id=feedback_id
    )
    if existing_drills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Drills already generated for this feedback run",
        )

    count = request.count if request else 3
    difficulty_ramp = request.difficulty_ramp if request else False

    # Start background processing
    background_tasks.add_task(
        generate_drills_async,
        db=db,
        feedback_run_id=feedback_id,
        user_id=current_user.id,
        count=count,
        difficulty_ramp=difficulty_ramp,
    )

    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={
            "message": "Drill generation started",
            "feedback_run_id": feedback_id,
            "requested_count": count,
            "poll_url": f"/api/v1/drills/feedback/{feedback_id}",
        },
    )


@router.get(
    "/feedback/{feedback_id}",
    response_model=DrillGenerationResult,
    summary="Get drills for feedback",
    description="Get all drills generated for a specific feedback run.",
)
async def get_drills_for_feedback(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> DrillGenerationResult:
    """Get drills for a feedback run."""
    logger.info(f"Getting drills for feedback {feedback_id} by user {current_user.id}")

    # Verify feedback ownership
    db_feedback = feedback_crud.get_feedback_run_by_user(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )

    if not db_feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback run not found",
        )

    drills = drill_crud.get_drills_by_feedback_run(db=db, feedback_run_id=feedback_id)

    return DrillGenerationResult(
        drills=drills,
        feedback_run_id=feedback_id,
        count=len(drills),
    )


@router.get(
    "",
    response_model=DrillList,
    summary="List user drills",
    description="Get a paginated list of drills for the authenticated user.",
)
async def list_drills(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[DrillStatus] = Query(None, alias="status"),
) -> DrillList:
    """List all drills for the current user."""
    logger.info(f"Listing drills for user {current_user.id}")

    drills = drill_crud.get_drills_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status_filter,
    )
    total = drill_crud.count_drills_by_user(
        db=db, user_id=current_user.id, status=status_filter
    )

    summaries = [
        DrillSummary(
            id=d.id,
            title=d.title,
            drill_type=d.drill_type,
            difficulty=d.difficulty,
            status=d.status,
            score=d.score,
        )
        for d in drills
    ]

    return DrillList(drills=summaries, total=total)


@router.get(
    "/pending",
    response_model=DrillList,
    summary="Get pending drills",
    description="Get pending drills for the authenticated user.",
)
async def get_pending_drills(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
    limit: int = Query(10, ge=1, le=50),
) -> DrillList:
    """Get pending drills."""
    logger.info(f"Getting pending drills for user {current_user.id}")

    drills = drill_crud.get_pending_drills_by_user(
        db=db, user_id=current_user.id, limit=limit
    )

    summaries = [
        DrillSummary(
            id=d.id,
            title=d.title,
            drill_type=d.drill_type,
            difficulty=d.difficulty,
            status=d.status,
            score=d.score,
        )
        for d in drills
    ]

    return DrillList(drills=summaries, total=len(drills))


@router.get(
    "/{drill_id}",
    response_model=Drill,
    summary="Get drill details",
    description="Get detailed information about a specific drill.",
)
async def get_drill(
    drill_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> Drill:
    """Get drill details."""
    logger.info(f"Getting drill {drill_id} for user {current_user.id}")

    db_drill = drill_crud.get_drill_by_user(
        db=db, drill_id=drill_id, user_id=current_user.id
    )

    if not db_drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found",
        )

    # Mark as delivered if not already
    if not db_drill.is_delivered:
        db_drill = drill_crud.deliver_drill(db=db, db_drill=db_drill)

    return db_drill


@router.get(
    "/{drill_id}/hints",
    response_model=DrillWithHints,
    summary="Get drill with hints",
    description="Get drill details including hints.",
)
async def get_drill_with_hints(
    drill_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> DrillWithHints:
    """Get drill with hints."""
    logger.info(f"Getting drill {drill_id} with hints for user {current_user.id}")

    db_drill = drill_crud.get_drill_by_user(
        db=db, drill_id=drill_id, user_id=current_user.id
    )

    if not db_drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found",
        )

    return DrillWithHints(
        id=db_drill.id,
        feedback_run_id=db_drill.feedback_run_id,
        user_id=db_drill.user_id,
        title=db_drill.title,
        prompt=db_drill.prompt,
        drill_type=db_drill.drill_type,
        difficulty=db_drill.difficulty,
        target_weakness=db_drill.target_weakness,
        target_skill=db_drill.target_skill,
        hints=db_drill.hints,
        status=db_drill.status,
        is_delivered=db_drill.is_delivered,
        delivered_at=db_drill.delivered_at,
        user_response=db_drill.user_response,
        score=db_drill.score,
        sequence_order=db_drill.sequence_order,
        created_at=db_drill.created_at,
        started_at=db_drill.started_at,
        completed_at=db_drill.completed_at,
    )


@router.post(
    "/{drill_id}/start",
    response_model=Drill,
    summary="Start a drill",
    description="Mark a drill as started.",
)
async def start_drill(
    drill_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> Drill:
    """Start a drill."""
    logger.info(f"Starting drill {drill_id} for user {current_user.id}")

    db_drill = drill_crud.get_drill_by_user(
        db=db, drill_id=drill_id, user_id=current_user.id
    )

    if not db_drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found",
        )

    if db_drill.status not in [DrillStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start drill with status: {db_drill.status}",
        )

    db_drill = drill_crud.start_drill(db=db, db_drill=db_drill)

    return db_drill


@router.post(
    "/{drill_id}/submit",
    response_model=Drill,
    summary="Submit drill response",
    description="Submit a response to a drill.",
)
async def submit_drill_response(
    drill_id: int,
    response_in: DrillSubmitResponse,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> Drill:
    """Submit drill response."""
    logger.info(f"Submitting response for drill {drill_id} by user {current_user.id}")

    db_drill = drill_crud.get_drill_by_user(
        db=db, drill_id=drill_id, user_id=current_user.id
    )

    if not db_drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found",
        )

    if db_drill.status in [DrillStatus.COMPLETED, DrillStatus.SKIPPED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit response for drill with status: {db_drill.status}",
        )

    db_drill = drill_crud.submit_drill_response(
        db=db, db_drill=db_drill, response=response_in
    )

    return db_drill


@router.post(
    "/{drill_id}/complete",
    response_model=Drill,
    summary="Complete a drill",
    description="Mark a drill as completed with an optional score.",
)
async def complete_drill(
    drill_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
    score: Optional[int] = Query(None, ge=0, le=100),
) -> Drill:
    """Complete a drill."""
    logger.info(f"Completing drill {drill_id} for user {current_user.id}")

    db_drill = drill_crud.get_drill_by_user(
        db=db, drill_id=drill_id, user_id=current_user.id
    )

    if not db_drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found",
        )

    if db_drill.status == DrillStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Drill is already completed",
        )

    db_drill = drill_crud.complete_drill(db=db, db_drill=db_drill, score=score)

    return db_drill


@router.post(
    "/{drill_id}/skip",
    response_model=Drill,
    summary="Skip a drill",
    description="Mark a drill as skipped.",
)
async def skip_drill(
    drill_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> Drill:
    """Skip a drill."""
    logger.info(f"Skipping drill {drill_id} for user {current_user.id}")

    db_drill = drill_crud.get_drill_by_user(
        db=db, drill_id=drill_id, user_id=current_user.id
    )

    if not db_drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found",
        )

    if db_drill.status in [DrillStatus.COMPLETED, DrillStatus.SKIPPED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Drill already has status: {db_drill.status}",
        )

    db_drill = drill_crud.skip_drill(db=db, db_drill=db_drill)

    return db_drill
