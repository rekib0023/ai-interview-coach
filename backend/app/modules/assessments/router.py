"""Session API endpoints for interview sessions."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_assessment_service, get_current_user, get_db
from app.modules.assessments.service import AssessmentService
from app.modules.users.models import User

from .models import AssessmentStatus
from .schemas import (
    Assessment,
    AssessmentCreate,
    AssessmentList,
    AssessmentSubmitResponse,
    AssessmentUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=Assessment,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assessment session",
    description="Create a new assessment session for the authenticated user.",
)
async def create_assessment(
    assessment_in: AssessmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
) -> Assessment:
    """Create a new assessment session."""
    logger.info(
        f"Creating assessment for user {current_user.id}: {assessment_in.topic}"
    )

    return assessment_service.create_assessment(
        db=db, user_id=current_user.id, assessment_in=assessment_in
    )


@router.get(
    "",
    response_model=AssessmentList,
    summary="List assessment sessions",
    description="Get a paginated list of assessment sessions for the authenticated user.",
)
async def list_assessments(
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[AssessmentStatus] = Query(None, alias="status"),
) -> AssessmentList:
    """Get all assessments for the current user."""
    logger.info(f"Listing assessments for user {current_user.id}")

    assessments, total = assessment_service.list_assessments(
        db=db,
        user_id=current_user.id,
        skip=(page - 1) * page_size,
        limit=page_size,
        status=status_filter,
    )

    return AssessmentList(
        assessments=assessments,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{assessment_id}",
    response_model=Assessment,
    summary="Get assessment session",
    description="Get details of a specific assessment session.",
)
async def get_assessment(
    assessment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
) -> Assessment:
    """Get a specific assessment."""
    logger.info(f"Getting assessment {assessment_id} for user {current_user.id}")
    return assessment_service.get_assessment(
        db=db, assessment_id=assessment_id, user_id=current_user.id
    )


@router.patch(
    "/{assessment_id}",
    response_model=Assessment,
    summary="Update assessment session",
    description="Update an existing assessment session.",
)
async def update_assessment(
    assessment_id: int,
    assessment_in: AssessmentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
) -> Assessment:
    """Update an assessment."""
    logger.info(f"Updating assessment {assessment_id} for user {current_user.id}")

    return assessment_service.update_assessment(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
        assessment_in=assessment_in,
    )


@router.post(
    "/{assessment_id}/submit",
    response_model=Assessment,
    summary="Submit assessment response",
    description="Submit a response (text or audio) for an assessment session.",
)
async def submit_response(
    assessment_id: int,
    response_in: AssessmentSubmitResponse,
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
) -> Assessment:
    """Submit a response to an assessment."""
    logger.info(
        f"Submitting response for assessment {assessment_id} by user {current_user.id}"
    )

    return assessment_service.submit_response(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
        response=response_in,
    )


@router.post(
    "/{assessment_id}/complete",
    response_model=Assessment,
    summary="Complete assessment session",
    description="Mark an assessment session as completed.",
)
async def complete_assessment(
    assessment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
    score: Optional[int] = Query(None, ge=0, le=100),
) -> Assessment:
    """Mark an assessment as complete."""
    logger.info(f"Completing assessment {assessment_id} for user {current_user.id}")

    return assessment_service.complete_assessment(
        db=db, assessment_id=assessment_id, user_id=current_user.id, score=score
    )


@router.delete(
    "/{assessment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete assessment session",
    description="Delete an assessment session.",
)
async def delete_assessment(
    assessment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    assessment_service: Annotated[AssessmentService, Depends(get_assessment_service)],
    db: Session = Depends(get_db),
) -> None:
    """Delete an assessment."""
    logger.info(f"Deleting assessment {assessment_id} for user {current_user.id}")

    await assessment_service.delete_assessment(
        db=db, assessment_id=assessment_id, user_id=current_user.id
    )
