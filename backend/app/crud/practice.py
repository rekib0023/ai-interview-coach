"""CRUD operations for drills with ownership scoping."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.practice import Practice, PracticeStatus
from app.schemas.practice import (
    PracticeCreate,
    PracticeSubmitResponse,
    PracticeUpdate,
)


def get_practice(db: Session, practice_id: int) -> Optional[Practice]:
    """Get a practice by ID."""
    return db.query(Practice).filter(Practice.id == practice_id).first()


def get_practice_by_user(
    db: Session, practice_id: int, user_id: int
) -> Optional[Practice]:
    """Get a practice by ID with ownership check."""
    return (
        db.query(Practice)
        .filter(Practice.id == practice_id, Practice.user_id == user_id)
        .first()
    )


def get_practices_by_feedback_run(db: Session, feedback_run_id: int) -> list[Practice]:
    """Get all practices for a feedback run."""
    return (
        db.query(Practice)
        .filter(Practice.feedback_run_id == feedback_run_id)
        .order_by(Practice.sequence_order)
        .all()
    )


def get_practices_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[PracticeStatus] = None,
) -> list[Practice]:
    """Get all practices for a user."""
    query = db.query(Practice).filter(Practice.user_id == user_id)

    if status:
        query = query.filter(Practice.status == status)

    return query.order_by(Practice.created_at.desc()).offset(skip).limit(limit).all()


def count_practices_by_user(
    db: Session, user_id: int, status: Optional[PracticeStatus] = None
) -> int:
    """Count practices for a user."""
    query = db.query(Practice).filter(Practice.user_id == user_id)

    if status:
        query = query.filter(Practice.status == status)

    return query.count()


def get_pending_practices_by_user(
    db: Session, user_id: int, limit: int = 10
) -> list[Practice]:
    """Get pending practices for a user."""
    return (
        db.query(Practice)
        .filter(Practice.user_id == user_id, Practice.status == PracticeStatus.PENDING)
        .order_by(Practice.created_at)
        .limit(limit)
        .all()
    )


def create_practice(db: Session, user_id: int, practice_in: PracticeCreate) -> Practice:
    """Create a new practice."""
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


def create_practices_batch(
    db: Session, user_id: int, practices_in: list[PracticeCreate]
) -> list[Practice]:
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


def update_practice(
    db: Session, db_practice: Practice, practice_in: PracticeUpdate
) -> Practice:
    """Update a practice."""
    update_data = practice_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_practice, field, value)

    db.commit()
    db.refresh(db_practice)
    return db_practice


def deliver_practice(db: Session, db_practice: Practice) -> Practice:
    """Mark a practice as delivered."""
    db_practice.is_delivered = True
    db_practice.delivered_at = datetime.utcnow()
    db.commit()
    db.refresh(db_practice)
    return db_practice


def start_practice(db: Session, db_practice: Practice) -> Practice:
    """Mark a practice as started."""
    db_practice.status = PracticeStatus.IN_PROGRESS
    db_practice.started_at = datetime.utcnow()
    db.commit()
    db.refresh(db_practice)
    return db_practice


def submit_practice_response(
    db: Session, db_practice: Practice, response: PracticeSubmitResponse
) -> Practice:
    """Submit a response to a practice."""
    db_practice.user_response = response.user_response
    db_practice.status = PracticeStatus.IN_PROGRESS
    if not db_practice.started_at:
        db_practice.started_at = datetime.utcnow()

    db.commit()
    db.refresh(db_practice)
    return db_practice


def complete_practice(
    db: Session, db_practice: Practice, score: Optional[int] = None
) -> Practice:
    """Mark a practice as completed."""
    db_practice.status = PracticeStatus.COMPLETED
    db_practice.completed_at = datetime.utcnow()
    if score is not None:
        db_practice.score = score

    db.commit()
    db.refresh(db_practice)
    return db_practice


def skip_practice(db: Session, db_practice: Practice) -> Practice:
    """Mark a practice as skipped."""
    db_practice.status = PracticeStatus.SKIPPED
    db_practice.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(db_practice)
    return db_practice


def delete_practice(db: Session, db_practice: Practice) -> bool:
    """Delete a practice."""
    db.delete(db_practice)
    db.commit()
    return True
