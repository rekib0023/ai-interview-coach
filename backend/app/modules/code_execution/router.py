"""Code execution API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_code_execution_service, get_current_user, get_db
from app.modules.assessments.models import Assessment, AssessmentStatus
from app.modules.users.models import User

from .models import CodeLanguage
from .service import CodeExecutionService

logger = logging.getLogger(__name__)

router = APIRouter()


class CodeExecutionRequest(BaseModel):
    """Request model for code execution."""

    code: str
    language: CodeLanguage


class CodeExecutionResponse(BaseModel):
    """Response model for code execution."""

    submission_id: int
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: int
    memory_used_mb: int
    timed_out: bool


@router.post(
    "/assessments/{assessment_id}/code",
    response_model=CodeExecutionResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute code",
    description="Execute code in a Docker sandbox for the given assessment.",
)
async def execute_code(
    assessment_id: int,
    request: CodeExecutionRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    code_service: Annotated[CodeExecutionService, Depends(get_code_execution_service)],
    db: Session = Depends(get_db),
) -> CodeExecutionResponse:
    """Execute code in a Docker container."""
    logger.info(
        f"Code execution request for assessment {assessment_id} by user {current_user.id}"
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
            detail=f"Cannot execute code for assessment with status: {assessment.status.value}",
        )

    # Validate code length
    if len(request.code) > 10000:  # 10KB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code exceeds maximum length of 10,000 characters",
        )

    # Execute code and save submission via service
    try:
        submission = await code_service.execute_and_save(
            db=db,
            code=request.code,
            language=request.language,
            assessment_id=assessment_id,
        )

        return CodeExecutionResponse(
            submission_id=submission.id,
            stdout=submission.result_output,
            stderr=submission.error_output,
            exit_code=submission.exit_code,
            execution_time_ms=submission.execution_time_ms,
            memory_used_mb=submission.memory_used_mb,
            timed_out=submission.timed_out,
        )

    except Exception as e:
        logger.error(f"Error executing code: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Code execution failed: {str(e)}",
        )


@router.get(
    "/assessments/{assessment_id}/code",
    summary="Get code submissions",
    description="Get all code submissions for an assessment.",
    response_model=list[
        dict
    ],  # Update this to a proper Pydantic schema if available, or just keeping simpler for now
)
async def get_code_submissions(
    assessment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    code_service: Annotated[CodeExecutionService, Depends(get_code_execution_service)],
    db: Session = Depends(get_db),
):
    """Get all code submissions for an assessment."""
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

    submissions = code_service.get_submissions(db=db, assessment_id=assessment_id)

    return [
        {
            "id": s.id,
            "language": s.language.value,
            "code_text": s.code_text,
            "result_output": s.result_output,
            "error_output": s.error_output,
            "execution_time_ms": s.execution_time_ms,
            "exit_code": s.exit_code,
            "timed_out": s.timed_out,
            "created_at": s.created_at.isoformat(),
        }
        for s in submissions
    ]
