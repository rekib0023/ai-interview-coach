"""Service for assessment business logic."""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.common.exceptions import BusinessLogicError, NotFoundError
from app.models.assessment import AssessmentStatus
from app.repositories.assessment import assessment_repository
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentSubmitResponse,
    AssessmentUpdate,
)


class AssessmentService:
    """Service for assessment operations."""

    def __init__(self, repository=None):
        self.repository = repository or assessment_repository

    def create_assessment(
        self, db: Session, *, user_id: int, assessment_in: AssessmentCreate
    ):
        """Create a new assessment."""
        return self.repository.create_for_user(
            db=db, obj_in=assessment_in, user_id=user_id
        )

    def get_assessment(self, db: Session, *, assessment_id: int, user_id: int):
        """Get an assessment by ID, ensuring it belongs to the user."""
        assessment = self.repository.get_by_user(
            db=db, user_id=user_id, assessment_id=assessment_id
        )
        if not assessment:
            raise NotFoundError(f"Assessment {assessment_id} not found")
        return assessment

    def list_assessments(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[AssessmentStatus] = None,
    ) -> tuple[List, int]:
        """List assessments for a user with pagination."""
        assessments = self.repository.get_all_by_user(
            db=db, user_id=user_id, skip=skip, limit=limit, status=status
        )
        total = self.repository.count_by_user(db=db, user_id=user_id, status=status)
        return assessments, total

    def update_assessment(
        self,
        db: Session,
        *,
        assessment_id: int,
        user_id: int,
        assessment_in: AssessmentUpdate,
    ):
        """Update an assessment."""
        assessment = self.get_assessment(
            db=db, assessment_id=assessment_id, user_id=user_id
        )

        # Business logic: Don't allow updating completed or cancelled assessments
        if assessment.status in [
            AssessmentStatus.COMPLETED,
            AssessmentStatus.CANCELLED,
        ]:
            raise BusinessLogicError(
                f"Cannot update assessment with status: {assessment.status}"
            )

        return self.repository.update(db=db, db_obj=assessment, obj_in=assessment_in)

    def submit_response(
        self,
        db: Session,
        *,
        assessment_id: int,
        user_id: int,
        response: AssessmentSubmitResponse,
    ):
        """Submit a response to an assessment."""
        assessment = self.get_assessment(
            db=db, assessment_id=assessment_id, user_id=user_id
        )

        # Business logic: Validate assessment status
        if assessment.status not in [
            AssessmentStatus.CREATED,
            AssessmentStatus.IN_PROGRESS,
        ]:
            raise BusinessLogicError(
                f"Cannot submit response for assessment with status: {assessment.status}"
            )

        # Business logic: Validate that at least one response type is provided
        if not response.response_text and not response.response_audio_url:
            raise BusinessLogicError(
                "Either response_text or response_audio_url must be provided"
            )

        return self.repository.submit_response(
            db=db, assessment=assessment, response=response
        )

    def complete_assessment(
        self,
        db: Session,
        *,
        assessment_id: int,
        user_id: int,
        score: Optional[int] = None,
    ):
        """Complete an assessment."""
        assessment = self.get_assessment(
            db=db, assessment_id=assessment_id, user_id=user_id
        )

        if assessment.status == AssessmentStatus.COMPLETED:
            raise BusinessLogicError("Assessment is already completed")

        return self.repository.complete(db=db, assessment=assessment, score=score)

    async def delete_assessment(self, db: Session, *, assessment_id: int, user_id: int):
        """Delete an assessment."""
        self.get_assessment(db=db, assessment_id=assessment_id, user_id=user_id)
        return self.repository.delete(db=db, id=assessment_id)


# Singleton instance
assessment_service = AssessmentService()
