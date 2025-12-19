"""Drawing API endpoints for Excalidraw diagrams."""

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api import deps
from app.api.deps import get_current_user
from app.models.assessment import Assessment, AssessmentStatus
from app.models.drawing import Drawing
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


class DrawingSaveRequest(BaseModel):
    """Request model for saving a drawing."""

    drawing_json: dict[str, Any]  # Excalidraw JSON format
    title: str | None = None
    version: str = "1.0.0"


class DrawingResponse(BaseModel):
    """Response model for drawing data."""

    id: int
    assessment_id: int
    drawing_json: dict[str, Any]
    title: str | None
    version: str
    created_at: str
    updated_at: str


@router.post(
    "/assessments/{assessment_id}/drawing",
    response_model=DrawingResponse,
    status_code=status.HTTP_200_OK,
    summary="Save drawing",
    description="Save or update an Excalidraw diagram for the assessment.",
)
async def save_drawing(
    assessment_id: int,
    request: DrawingSaveRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> DrawingResponse:
    """Save or update a drawing."""
    logger.info(
        f"Saving drawing for assessment {assessment_id} by user {current_user.id}"
    )

    # Verify assessment ownership and status
    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    if assessment.status not in [
        AssessmentStatus.IN_PROGRESS,
        AssessmentStatus.CREATED,
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot save drawing for assessment with status: {assessment.status.value}",
        )

    # Check if drawing already exists for this assessment
    existing_drawing = (
        db.query(Drawing).filter(Drawing.assessment_id == assessment_id).first()
    )

    if existing_drawing:
        # Update existing drawing
        existing_drawing.drawing_json = request.drawing_json
        if request.title:
            existing_drawing.title = request.title
        existing_drawing.version = request.version
        db.commit()
        db.refresh(existing_drawing)

        return DrawingResponse(
            id=existing_drawing.id,
            assessment_id=existing_drawing.assessment_id,
            drawing_json=existing_drawing.drawing_json,
            title=existing_drawing.title,
            version=existing_drawing.version,
            created_at=existing_drawing.created_at.isoformat(),
            updated_at=existing_drawing.updated_at.isoformat(),
        )
    else:
        # Create new drawing
        drawing = Drawing(
            assessment_id=assessment_id,
            drawing_json=request.drawing_json,
            title=request.title,
            version=request.version,
        )
        db.add(drawing)
        db.commit()
        db.refresh(drawing)

        return DrawingResponse(
            id=drawing.id,
            assessment_id=drawing.assessment_id,
            drawing_json=drawing.drawing_json,
            title=drawing.title,
            version=drawing.version,
            created_at=drawing.created_at.isoformat(),
            updated_at=drawing.updated_at.isoformat(),
        )


@router.get(
    "/assessments/{assessment_id}/drawing",
    response_model=DrawingResponse | None,
    summary="Get drawing",
    description="Get the Excalidraw diagram for an assessment.",
)
async def get_drawing(
    assessment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(deps.get_db),
) -> DrawingResponse | None:
    """Get drawing for an assessment."""
    # Verify assessment ownership
    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    drawing = db.query(Drawing).filter(Drawing.assessment_id == assessment_id).first()

    if not drawing:
        return None

    return DrawingResponse(
        id=drawing.id,
        assessment_id=drawing.assessment_id,
        drawing_json=drawing.drawing_json,
        title=drawing.title,
        version=drawing.version,
        created_at=drawing.created_at.isoformat(),
        updated_at=drawing.updated_at.isoformat(),
    )
