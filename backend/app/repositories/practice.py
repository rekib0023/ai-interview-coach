"""Repository for practices."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.practice import Practice, PracticeStatus
from app.repositories.base import BaseRepository
from app.schemas.practice import PracticeCreate, PracticeSubmitResponse, PracticeUpdate


class PracticeRepository(BaseRepository[Practice, PracticeCreate, PracticeUpdate]):
    """Repository for practice operations."""

    def __init__(self):
        super().__init__(Practice)

    def create_for_user(
        self, db: Session, *, user_id: int, practice_in: PracticeCreate
    ) -> Practice:
        """Create a new practice for a user."""
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
            sequence_order=practice_in.sequence_order,
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
        """Get a practice by ID that belongs to a user."""
        return (
            db.query(Practice)
            .filter(Practice.id == practice_id, Practice.user_id == user_id)
            .first()
        )

    def get_all_by_feedback_run(
        self, db: Session, *, feedback_run_id: int
    ) -> List[Practice]:
        """Get all practices for a feedback run."""
        return (
            db.query(Practice)
            .filter(Practice.feedback_run_id == feedback_run_id)
            .order_by(Practice.sequence_order)
            .all()
        )

    def get_all_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[PracticeStatus] = None,
    ) -> List[Practice]:
        """Get all practices for a user."""
        query = db.query(Practice).filter(Practice.user_id == user_id)

        if status:
            query = query.filter(Practice.status == status)

        return (
            query.order_by(Practice.created_at.desc()).offset(skip).limit(limit).all()
        )

    def count_by_user(
        self, db: Session, *, user_id: int, status: Optional[PracticeStatus] = None
    ) -> int:
        """Count practices for a user."""
        query = db.query(Practice).filter(Practice.user_id == user_id)

        if status:
            query = query.filter(Practice.status == status)

        return query.count()

    def get_pending_by_user(
        self, db: Session, *, user_id: int, limit: int = 10
    ) -> List[Practice]:
        """Get pending practices for a user."""
        return (
            db.query(Practice)
            .filter(
                Practice.user_id == user_id, Practice.status == PracticeStatus.PENDING
            )
            .order_by(Practice.created_at)
            .limit(limit)
            .all()
        )

    def mark_delivered(self, db: Session, *, practice: Practice) -> Practice:
        """Mark a practice as delivered."""
        practice.is_delivered = True
        practice.delivered_at = datetime.utcnow()
        db.commit()
        db.refresh(practice)
        return practice

    def start(self, db: Session, *, practice: Practice) -> Practice:
        """Mark a practice as started."""
        practice.status = PracticeStatus.IN_PROGRESS
        practice.started_at = datetime.utcnow()
        db.commit()
        db.refresh(practice)
        return practice

    def submit_response(
        self, db: Session, *, practice: Practice, response: PracticeSubmitResponse
    ) -> Practice:
        """Submit a response to a practice."""
        practice.user_response = response.user_response
        practice.status = PracticeStatus.IN_PROGRESS
        if not practice.started_at:
            practice.started_at = datetime.utcnow()

        db.commit()
        db.refresh(practice)
        return practice

    def complete(
        self, db: Session, *, practice: Practice, score: Optional[int] = None
    ) -> Practice:
        """Mark a practice as completed."""
        practice.status = PracticeStatus.COMPLETED
        practice.completed_at = datetime.utcnow()
        if score is not None:
            practice.score = score

        db.commit()
        db.refresh(practice)
        return practice

    def skip(self, db: Session, *, practice: Practice) -> Practice:
        """Mark a practice as skipped."""
        practice.status = PracticeStatus.SKIPPED
        practice.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(practice)
        return practice


# Singleton instance
practice_repository = PracticeRepository()
