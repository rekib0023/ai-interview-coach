"""CRUD operations for drills with ownership scoping."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.drill import Drill, DrillStatus
from app.schemas.drill import DrillCreate, DrillUpdate, DrillSubmitResponse


def get_drill(db: Session, drill_id: int) -> Optional[Drill]:
    """Get a drill by ID."""
    return db.query(Drill).filter(Drill.id == drill_id).first()


def get_drill_by_user(db: Session, drill_id: int, user_id: int) -> Optional[Drill]:
    """Get a drill by ID with ownership check."""
    return (
        db.query(Drill).filter(Drill.id == drill_id, Drill.user_id == user_id).first()
    )


def get_drills_by_feedback_run(db: Session, feedback_run_id: int) -> list[Drill]:
    """Get all drills for a feedback run."""
    return (
        db.query(Drill)
        .filter(Drill.feedback_run_id == feedback_run_id)
        .order_by(Drill.sequence_order)
        .all()
    )


def get_drills_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[DrillStatus] = None,
) -> list[Drill]:
    """Get all drills for a user."""
    query = db.query(Drill).filter(Drill.user_id == user_id)

    if status:
        query = query.filter(Drill.status == status)

    return query.order_by(Drill.created_at.desc()).offset(skip).limit(limit).all()


def count_drills_by_user(
    db: Session, user_id: int, status: Optional[DrillStatus] = None
) -> int:
    """Count drills for a user."""
    query = db.query(Drill).filter(Drill.user_id == user_id)

    if status:
        query = query.filter(Drill.status == status)

    return query.count()


def get_pending_drills_by_user(
    db: Session, user_id: int, limit: int = 10
) -> list[Drill]:
    """Get pending drills for a user."""
    return (
        db.query(Drill)
        .filter(Drill.user_id == user_id, Drill.status == DrillStatus.PENDING)
        .order_by(Drill.created_at)
        .limit(limit)
        .all()
    )


def create_drill(db: Session, user_id: int, drill_in: DrillCreate) -> Drill:
    """Create a new drill."""
    db_drill = Drill(
        feedback_run_id=drill_in.feedback_run_id,
        user_id=user_id,
        title=drill_in.title,
        prompt=drill_in.prompt,
        drill_type=drill_in.drill_type,
        difficulty=drill_in.difficulty,
        target_weakness=drill_in.target_weakness,
        target_skill=drill_in.target_skill,
        expected_answer=drill_in.expected_answer,
        hints=drill_in.hints,
        sequence_order=drill_in.sequence_order,
        status=DrillStatus.PENDING,
    )
    db.add(db_drill)
    db.commit()
    db.refresh(db_drill)
    return db_drill


def create_drills_batch(
    db: Session, user_id: int, drills_in: list[DrillCreate]
) -> list[Drill]:
    """Create multiple drills in a batch."""
    db_drills = []
    for i, drill_in in enumerate(drills_in):
        db_drill = Drill(
            feedback_run_id=drill_in.feedback_run_id,
            user_id=user_id,
            title=drill_in.title,
            prompt=drill_in.prompt,
            drill_type=drill_in.drill_type,
            difficulty=drill_in.difficulty,
            target_weakness=drill_in.target_weakness,
            target_skill=drill_in.target_skill,
            expected_answer=drill_in.expected_answer,
            hints=drill_in.hints,
            sequence_order=drill_in.sequence_order or i,
            status=DrillStatus.PENDING,
        )
        db.add(db_drill)
        db_drills.append(db_drill)

    db.commit()
    for drill in db_drills:
        db.refresh(drill)

    return db_drills


def update_drill(db: Session, db_drill: Drill, drill_in: DrillUpdate) -> Drill:
    """Update a drill."""
    update_data = drill_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_drill, field, value)

    db.commit()
    db.refresh(db_drill)
    return db_drill


def deliver_drill(db: Session, db_drill: Drill) -> Drill:
    """Mark a drill as delivered."""
    db_drill.is_delivered = True
    db_drill.delivered_at = datetime.utcnow()
    db.commit()
    db.refresh(db_drill)
    return db_drill


def start_drill(db: Session, db_drill: Drill) -> Drill:
    """Mark a drill as started."""
    db_drill.status = DrillStatus.IN_PROGRESS
    db_drill.started_at = datetime.utcnow()
    db.commit()
    db.refresh(db_drill)
    return db_drill


def submit_drill_response(
    db: Session, db_drill: Drill, response: DrillSubmitResponse
) -> Drill:
    """Submit a response to a drill."""
    db_drill.user_response = response.user_response
    db_drill.status = DrillStatus.IN_PROGRESS
    if not db_drill.started_at:
        db_drill.started_at = datetime.utcnow()

    db.commit()
    db.refresh(db_drill)
    return db_drill


def complete_drill(db: Session, db_drill: Drill, score: Optional[int] = None) -> Drill:
    """Mark a drill as completed."""
    db_drill.status = DrillStatus.COMPLETED
    db_drill.completed_at = datetime.utcnow()
    if score is not None:
        db_drill.score = score

    db.commit()
    db.refresh(db_drill)
    return db_drill


def skip_drill(db: Session, db_drill: Drill) -> Drill:
    """Mark a drill as skipped."""
    db_drill.status = DrillStatus.SKIPPED
    db_drill.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(db_drill)
    return db_drill


def delete_drill(db: Session, db_drill: Drill) -> bool:
    """Delete a drill."""
    db.delete(db_drill)
    db.commit()
    return True
