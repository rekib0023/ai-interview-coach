"""Repository for feedback runs."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.assessment import Assessment
from app.models.feedback import FeedbackRun, FeedbackStatus
from app.repositories.base import BaseRepository
from app.schemas.feedback import FeedbackRunCreate


class FeedbackRepository(
    BaseRepository[FeedbackRun, FeedbackRunCreate, FeedbackRunCreate]
):
    """Repository for feedback run operations."""

    def __init__(self):
        super().__init__(FeedbackRun)

    def create_for_session(
        self, db: Session, *, obj_in: FeedbackRunCreate, session_id: int
    ) -> FeedbackRun:
        """Create a feedback run for a session."""
        obj_in_data = obj_in.model_dump()
        db_obj = FeedbackRun(
            **obj_in_data, session_id=session_id, status=FeedbackStatus.PENDING
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(
        self, db: Session, *, feedback_id: int, user_id: int
    ) -> Optional[FeedbackRun]:
        """Get feedback by ID that belongs to a user's session."""
        return (
            db.query(FeedbackRun)
            .join(Assessment)
            .filter(FeedbackRun.id == feedback_id, Assessment.user_id == user_id)
            .first()
        )

    def get_all_by_session(self, db: Session, *, session_id: int) -> List[FeedbackRun]:
        """Get all feedback runs for a session."""
        return (
            db.query(FeedbackRun)
            .filter(FeedbackRun.session_id == session_id)
            .order_by(FeedbackRun.created_at.desc())
            .all()
        )

    def get_all_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[FeedbackStatus] = None,
    ) -> List[FeedbackRun]:
        """Get all feedback runs for a user."""
        query = (
            db.query(FeedbackRun).join(Assessment).filter(Assessment.user_id == user_id)
        )
        if status:
            query = query.filter(FeedbackRun.status == status)
        return (
            query.order_by(FeedbackRun.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_user(
        self, db: Session, *, user_id: int, status: Optional[FeedbackStatus] = None
    ) -> int:
        """Count feedback runs for a user."""
        query = (
            db.query(FeedbackRun).join(Assessment).filter(Assessment.user_id == user_id)
        )
        if status:
            query = query.filter(FeedbackRun.status == status)
        return query.count()

    def start_processing(self, db: Session, *, feedback: FeedbackRun) -> FeedbackRun:
        """Mark feedback as processing."""
        update_data = {
            "status": FeedbackStatus.PROCESSING,
            "started_at": datetime.utcnow(),
        }
        return self.update(db, db_obj=feedback, obj_in=update_data)

    def complete_processing(
        self,
        db: Session,
        *,
        feedback: FeedbackRun,
        overall_score: int,
        criterion_scores: Optional[dict] = None,
        strengths: Optional[List[str]] = None,
        weaknesses: Optional[List[str]] = None,
        suggestions: Optional[List[str]] = None,
        detailed_feedback: Optional[str] = None,
        model_name: Optional[str] = None,
        prompt_id: Optional[str] = None,
        latency_ms: Optional[int] = None,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None,
        total_cost_usd: Optional[float] = None,
    ) -> FeedbackRun:
        """Mark feedback as completed with results."""
        update_data = {
            "status": FeedbackStatus.COMPLETED,
            "completed_at": datetime.utcnow(),
            "overall_score": overall_score,
            "criterion_scores": criterion_scores,
            "strengths": strengths or [],
            "weaknesses": weaknesses or [],
            "suggestions": suggestions or [],
            "detailed_feedback": detailed_feedback,
            "model_name": model_name,
            "prompt_id": prompt_id,
            "latency_ms": latency_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_cost_usd": total_cost_usd,
        }
        return self.update(db, db_obj=feedback, obj_in=update_data)

    def mark_failed(
        self,
        db: Session,
        *,
        feedback: FeedbackRun,
        error_message: str,
    ) -> FeedbackRun:
        """Mark feedback as failed."""
        update_data = {
            "status": FeedbackStatus.FAILED,
            "completed_at": datetime.utcnow(),
            "error_message": error_message,
            "retry_count": feedback.retry_count + 1,
        }
        return self.update(db, db_obj=feedback, obj_in=update_data)


# Singleton instance
feedback_repository = FeedbackRepository()
