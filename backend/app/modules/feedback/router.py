"""Feedback API endpoints for AI feedback on interview sessions."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.modules.users.models import User

from app.core.dependencies import get_feedback_service
from .models import FeedbackStatus
from .schemas import (
    FeedbackRequestResponse,
    FeedbackResult,
    FeedbackRun,
    FeedbackRunList,
    FeedbackRunRequest,
    FeedbackRunSummary,
    FeedbackStatusResponse,
)
from .service import FeedbackService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/assessments/{assessment_id}/feedback",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=FeedbackRequestResponse,
    summary="Request feedback for session",
    description="Request AI-generated feedback for an interview session. Returns 202 with polling endpoint.",
)
async def request_feedback(
    assessment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    feedback_service: Annotated[FeedbackService, Depends(get_feedback_service)],
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    request: Optional[FeedbackRunRequest] = None,
) -> FeedbackRequestResponse:
    """Request feedback for a session."""
    logger.info(
        f"Requesting feedback for assessment {assessment_id} by user {current_user.id}"
    )

    # Create feedback run via service
    db_feedback = feedback_service.create_feedback_run(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
        rubric_id=request.rubric_id if request else None,
    )

    # Start background processing
    background_tasks.add_task(
        feedback_service.generate_feedback,
        db=db,
        feedback_run_id=db_feedback.id,
    )

    # Return 202 with location for polling
    return FeedbackRequestResponse(
        id=db_feedback.id,
        status=db_feedback.status,
        message="Feedback generation started",
        poll_url=f"/api/v1/feedback/{db_feedback.id}",
    )


@router.get(
    "/{feedback_id}",
    response_model=FeedbackRun,
    summary="Get feedback run details",
    description="Get detailed information about a feedback run.",
)
async def get_feedback(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    feedback_service: Annotated[FeedbackService, Depends(get_feedback_service)],
    db: Session = Depends(get_db),
) -> FeedbackRun:
    """Get feedback run details."""
    logger.info(f"Getting feedback {feedback_id} for user {current_user.id}")

    return feedback_service.get_feedback_run(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )


@router.get(
    "/{feedback_id}/status",
    response_model=FeedbackStatusResponse,
    summary="Poll feedback status",
    description="Check the current status of a feedback run (for polling).",
)
async def get_feedback_status(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    feedback_service: Annotated[FeedbackService, Depends(get_feedback_service)],
    db: Session = Depends(get_db),
) -> FeedbackStatusResponse:
    """Poll feedback status."""
    db_feedback = feedback_service.get_feedback_run(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )

    # Calculate estimated completion time based on status
    estimated_seconds = None
    progress_message = None

    if db_feedback.status == FeedbackStatus.PENDING:
        progress_message = "Waiting to start processing"
        estimated_seconds = 10
    elif db_feedback.status == FeedbackStatus.PROCESSING:
        progress_message = "Analyzing response and generating feedback"
        estimated_seconds = 5
    elif db_feedback.status == FeedbackStatus.COMPLETED:
        progress_message = "Feedback ready"
    elif db_feedback.status == FeedbackStatus.FAILED:
        progress_message = f"Failed: {db_feedback.error_message or 'Unknown error'}"

    return FeedbackStatusResponse(
        id=db_feedback.id,
        status=db_feedback.status,
        progress_message=progress_message,
        estimated_completion_seconds=estimated_seconds,
    )


@router.get(
    "/{feedback_id}/result",
    response_model=FeedbackResult,
    summary="Get feedback result",
    description="Get the feedback result once processing is complete.",
)
async def get_feedback_result(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    feedback_service: Annotated[FeedbackService, Depends(get_feedback_service)],
    db: Session = Depends(get_db),
) -> FeedbackResult:
    """Get feedback result."""
    logger.info(f"Getting feedback result {feedback_id} for user {current_user.id}")

    db_feedback = feedback_service.get_feedback_run(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )

    if db_feedback.status != FeedbackStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Feedback not ready. Current status: {db_feedback.status}",
        )

    # Get rubric info if available
    rubric_name = None
    rubric_version = None
    if db_feedback.rubric:
        rubric_name = db_feedback.rubric.name
        rubric_version = db_feedback.rubric.version

    return FeedbackResult(
        id=db_feedback.id,
        assessment_id=db_feedback.assessment_id,
        status=db_feedback.status,
        overall_score=db_feedback.overall_score,
        criterion_scores=db_feedback.criterion_scores,
        strengths=db_feedback.strengths or [],
        weaknesses=db_feedback.weaknesses or [],
        suggestions=db_feedback.suggestions or [],
        detailed_feedback=db_feedback.detailed_feedback,
        rubric_name=rubric_name,
        rubric_version=rubric_version,
        created_at=db_feedback.created_at,
        completed_at=db_feedback.completed_at,
    )


@router.get(
    "",
    response_model=FeedbackRunList,
    summary="List feedback runs",
    description="Get a list of feedback runs for the authenticated user.",
)
async def list_feedback_runs(
    current_user: Annotated[User, Depends(get_current_user)],
    feedback_service: Annotated[FeedbackService, Depends(get_feedback_service)],
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[FeedbackStatus] = Query(None, alias="status"),
) -> FeedbackRunList:
    """List all feedback runs for the current user."""
    logger.info(f"Listing feedback runs for user {current_user.id}")

    feedback_runs = feedback_service.list_feedback_runs(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status_filter,
    )
    total = feedback_service.count_feedback_runs(
        db=db, user_id=current_user.id, status=status_filter
    )

    summaries = [
        FeedbackRunSummary(
            id=f.id,
            session_id=f.assessment_id,  # Mapping assessment_id to session_id for schema
            status=f.status,
            overall_score=f.overall_score,
            created_at=f.created_at,
            completed_at=f.completed_at,
        )
        for f in feedback_runs
    ]

    return FeedbackRunList(
        feedback_runs=summaries,
        total=total,
    )


@router.post(
    "/{feedback_id}/retry",
    response_model=FeedbackStatusResponse,
    summary="Retry failed feedback",
    description="Retry a failed feedback run.",
)
async def retry_feedback(
    feedback_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    feedback_service: Annotated[FeedbackService, Depends(get_feedback_service)],
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
) -> FeedbackStatusResponse:
    """Retry a failed feedback run."""
    logger.info(f"Retrying feedback {feedback_id} for user {current_user.id}")

    # Retry via service (handles validation)
    db_feedback = feedback_service.retry_feedback_run(
        db=db, feedback_id=feedback_id, user_id=current_user.id
    )

    # Start background processing
    background_tasks.add_task(
        feedback_service.generate_feedback,
        db=db,
        feedback_run_id=db_feedback.id,
    )

    return FeedbackStatusResponse(
        id=db_feedback.id,
        status=db_feedback.status,
        progress_message="Retry initiated",
        estimated_completion_seconds=10,
    )
