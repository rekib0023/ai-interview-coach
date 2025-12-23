"""CRUD operations for practices with ownership scoping."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.shared.base_crud import CRUDBase

from .models import Practice, PracticeStatus
from .schemas import PracticeCreate, PracticeSubmitResponse, PracticeUpdate


class CRUDPractice(CRUDBase[Practice, PracticeCreate, PracticeUpdate]):
    """CRUD operations for Practice model."""

    def create_with_owner(
        self, db: Session, *, obj_in: PracticeCreate, user_id: int
    ) -> Practice:
        """Create a new practice with user ownership."""
        db_practice = Practice(
            feedback_run_id=obj_in.feedback_run_id,
            user_id=user_id,
            title=obj_in.title,
            prompt=obj_in.prompt,
            practice_type=obj_in.practice_type,
            difficulty=obj_in.difficulty,
            target_weakness=obj_in.target_weakness,
            target_skill=obj_in.target_skill,
            expected_answer=obj_in.expected_answer,
            hints=obj_in.hints,
            sequence_order=obj_in.sequence_order,
            status=PracticeStatus.PENDING,
        )
        db.add(db_practice)
        db.commit()
        db.refresh(db_practice)
        return db_practice

    def create_batch(
        self, db: Session, *, user_id: int, practices_in: List[PracticeCreate]
    ) -> List[Practice]:
        """Create multiple practices in a batch."""
        db_practices = []
        for i, practice_in in enumerate(practices_in):
            db_practice = Practice(
                feedback_run_id=practice_in.feedback_run_id,
                user_id=user_id,
                title=practice_in.title,
                prompt=practice_in.prompt,
                practice_type=practice_in.practice_type,
                difficulty=practice_in.difficulty,
                target_weakness=practice_in.target_weakness,
                target_skill=practice_in.target_skill,
                expected_answer=practice_in.expected_answer,
                hints=practice_in.hints,
                sequence_order=practice_in.sequence_order or i,
                status=PracticeStatus.PENDING,
            )
            db.add(db_practice)
            db_practices.append(db_practice)

        db.commit()
        for practice in db_practices:
            db.refresh(practice)

        return db_practices

    def get_by_user(
        self, db: Session, *, practice_id: int, user_id: int
    ) -> Optional[Practice]:
        """Get a practice by ID with ownership check."""
        return (
            db.query(self.model)
            .filter(self.model.id == practice_id, self.model.user_id == user_id)
            .first()
        )

    def get_by_feedback_run(
        self, db: Session, *, feedback_run_id: int
    ) -> List[Practice]:
        """Get all practices for a feedback run."""
        return (
            db.query(self.model)
            .filter(self.model.feedback_run_id == feedback_run_id)
            .order_by(self.model.sequence_order)
            .all()
        )

    def get_multi_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[PracticeStatus] = None,
    ) -> List[Practice]:
        """Get all practices for a user with filtering and pagination."""
        query = db.query(self.model).filter(self.model.user_id == user_id)

        if status:
            query = query.filter(self.model.status == status)

        return (
            query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        )

    def count_by_user(
        self, db: Session, *, user_id: int, status: Optional[PracticeStatus] = None
    ) -> int:
        """Count practices for a user."""
        query = db.query(self.model).filter(self.model.user_id == user_id)

        if status:
            query = query.filter(self.model.status == status)

        return query.count()

    def get_pending_by_user(
        self, db: Session, *, user_id: int, limit: int = 10
    ) -> List[Practice]:
        """Get pending practices for a user."""
        return (
            db.query(self.model)
            .filter(
                self.model.user_id == user_id,
                self.model.status == PracticeStatus.PENDING,
            )
            .order_by(self.model.created_at)
            .limit(limit)
            .all()
        )

    def deliver(self, db: Session, *, db_obj: Practice) -> Practice:
        """Mark a practice as delivered."""
        db_obj.is_delivered = True
        db_obj.delivered_at = datetime.utcnow()
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def start(self, db: Session, *, db_obj: Practice) -> Practice:
        """Mark a practice as started."""
        db_obj.status = PracticeStatus.IN_PROGRESS
        db_obj.started_at = datetime.utcnow()
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def submit_response(
        self, db: Session, *, db_obj: Practice, response: PracticeSubmitResponse
    ) -> Practice:
        """Submit a response to a practice."""
        db_obj.user_response = response.user_response
        db_obj.status = PracticeStatus.IN_PROGRESS
        if not db_obj.started_at:
            db_obj.started_at = datetime.utcnow()

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def complete(
        self, db: Session, *, db_obj: Practice, score: Optional[int] = None
    ) -> Practice:
        """Mark a practice as completed."""
        db_obj.status = PracticeStatus.COMPLETED
        db_obj.completed_at = datetime.utcnow()
        if score is not None:
            db_obj.score = score

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def skip(self, db: Session, *, db_obj: Practice) -> Practice:
        """Mark a practice as skipped."""
        db_obj.status = PracticeStatus.SKIPPED
        db_obj.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(db_obj)
        return db_obj


practice = CRUDPractice(Practice)
