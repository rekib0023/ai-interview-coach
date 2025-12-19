"""Repository for assessments."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.assessment import Assessment, AssessmentStatus
from app.repositories.base import BaseRepository
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentSubmitResponse,
    AssessmentUpdate,
)


class AssessmentRepository(
    BaseRepository[Assessment, AssessmentCreate, AssessmentUpdate]
):
    """Repository for assessment operations."""

    def __init__(self):
        super().__init__(Assessment)

    def create_for_user(
        self, db: Session, *, obj_in: AssessmentCreate, user_id: int
    ) -> Assessment:
        """Create a new assessment for a specific user."""
        obj_in_data = obj_in.model_dump()
        db_obj = Assessment(
            **obj_in_data, user_id=user_id, status=AssessmentStatus.CREATED
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(
        self, db: Session, *, user_id: int, assessment_id: int
    ) -> Optional[Assessment]:
        """Get an assessment by ID that belongs to a specific user."""
        return (
            db.query(Assessment)
            .filter(
                Assessment.id == assessment_id,
                Assessment.user_id == user_id,
            )
            .first()
        )

    def get_all_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[AssessmentStatus] = None,
    ) -> List[Assessment]:
        """Get all assessments for a user with optional status filter."""
        query = db.query(Assessment).filter(Assessment.user_id == user_id)

        if status:
            query = query.filter(Assessment.status == status)

        return (
            query.order_by(Assessment.created_at.desc()).offset(skip).limit(limit).all()
        )

    def count_by_user(
        self, db: Session, *, user_id: int, status: Optional[AssessmentStatus] = None
    ) -> int:
        """Count assessments for a user."""
        query = db.query(Assessment).filter(Assessment.user_id == user_id)

        if status:
            query = query.filter(Assessment.status == status)

        return query.count()

    def submit_response(
        self,
        db: Session,
        *,
        assessment: Assessment,
        response: AssessmentSubmitResponse,
    ) -> Assessment:
        """Submit a response to an assessment."""
        update_data = response.model_dump(exclude_unset=True)
        update_data["status"] = AssessmentStatus.AWAITING_FEEDBACK
        update_data["updated_at"] = datetime.utcnow()
        return self.update(db, db_obj=assessment, obj_in=update_data)

    def complete(
        self,
        db: Session,
        *,
        assessment: Assessment,
        score: Optional[int] = None,
    ) -> Assessment:
        """Mark an assessment as completed."""
        update_data = {
            "status": AssessmentStatus.COMPLETED,
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        if score is not None:
            update_data["score"] = score
        return self.update(db, db_obj=assessment, obj_in=update_data)


# Singleton instance
assessment_repository = AssessmentRepository()
