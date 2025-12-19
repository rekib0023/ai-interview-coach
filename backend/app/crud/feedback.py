from datetime import datetime
from typing import List, Optional

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.feedback import FeedbackRun, FeedbackStatus
from app.models.assessment import Assessment
from app.schemas.feedback import FeedbackRunCreate


class CRUDFeedback(CRUDBase[FeedbackRun, FeedbackRunCreate, FeedbackRunCreate]):
    def create(self, db: Session, *, obj_in: FeedbackRunCreate) -> FeedbackRun:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data, status=FeedbackStatus.PENDING)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(
        self, db: Session, *, feedback_id: int, user_id: int
    ) -> Optional[FeedbackRun]:
        return (
            db.query(FeedbackRun)
            .join(Assessment)
            .filter(FeedbackRun.id == feedback_id, Assessment.user_id == user_id)
            .first()
        )

    def get_multi_by_session(
        self, db: Session, *, session_id: int
    ) -> List[FeedbackRun]:
        return (
            db.query(FeedbackRun)
            .filter(FeedbackRun.session_id == session_id)
            .order_by(FeedbackRun.created_at.desc())
            .all()
        )

    def get_multi_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[FeedbackStatus] = None,
    ) -> List[FeedbackRun]:
        query = (
            db.query(FeedbackRun)
            .join(Assessment)
            .filter(Assessment.user_id == user_id)
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
        query = (
            db.query(FeedbackRun)
            .join(Assessment)
            .filter(Assessment.user_id == user_id)
        )
        if status:
            query = query.filter(FeedbackRun.status == status)
        return query.count()

    def start(self, db: Session, *, db_feedback: FeedbackRun) -> FeedbackRun:
        update_data = {
            "status": FeedbackStatus.PROCESSING,
            "started_at": datetime.utcnow(),
        }
        return self.update(db, db_obj=db_feedback, obj_in=update_data)

    def complete(
        self,
        db: Session,
        *,
        db_feedback: FeedbackRun,
        overall_score: int,
        criterion_scores: Optional[dict] = None,
        strengths: Optional[list[str]] = None,
        weaknesses: Optional[list[str]] = None,
        suggestions: Optional[list[str]] = None,
        detailed_feedback: Optional[str] = None,
        model_name: Optional[str] = None,
        model_version: Optional[str] = None,
        prompt_id: Optional[str] = None,
        prompt_template_version: Optional[str] = None,
        latency_ms: Optional[int] = None,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None,
        total_cost_usd: Optional[float] = None,
    ) -> FeedbackRun:
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
            "model_version": model_version,
            "prompt_id": prompt_id,
            "prompt_template_version": prompt_template_version,
            "latency_ms": latency_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_cost_usd": total_cost_usd,
        }
        return self.update(db, db_obj=db_feedback, obj_in=update_data)

    def fail(
        self,
        db: Session,
        *,
        db_feedback: FeedbackRun,
        error_message: str,
        content_filtered: bool = False,
        refusal_reason: Optional[str] = None,
        safety_flags: Optional[dict] = None,
    ) -> FeedbackRun:
        update_data = {
            "status": FeedbackStatus.FAILED,
            "completed_at": datetime.utcnow(),
            "error_message": error_message,
            "content_filtered": content_filtered,
            "refusal_reason": refusal_reason,
            "safety_flags": safety_flags,
            "retry_count": db_feedback.retry_count + 1,
        }
        return self.update(db, db_obj=db_feedback, obj_in=update_data)

    def retry(self, db: Session, *, db_feedback: FeedbackRun) -> FeedbackRun:
        update_data = {
            "status": FeedbackStatus.PENDING,
            "started_at": None,
            "completed_at": None,
            "error_message": None,
        }
        return self.update(db, db_obj=db_feedback, obj_in=update_data)


feedback = CRUDFeedback(FeedbackRun)
