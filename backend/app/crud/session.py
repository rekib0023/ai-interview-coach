"""CRUD operations for interview sessions with ownership scoping."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.interview_session import InterviewSession, SessionStatus
from app.schemas.session import (
    InterviewSessionCreate,
    InterviewSessionUpdate,
    InterviewSessionSubmitResponse,
)


def get_session(db: Session, session_id: int) -> Optional[InterviewSession]:
    """Get a session by ID."""
    return db.query(InterviewSession).filter(InterviewSession.id == session_id).first()


def get_session_by_user(
    db: Session, session_id: int, user_id: int
) -> Optional[InterviewSession]:
    """Get a session by ID with ownership check."""
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id)
        .first()
    )


def get_sessions_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[SessionStatus] = None,
) -> list[InterviewSession]:
    """Get all sessions for a user with optional filtering."""
    query = db.query(InterviewSession).filter(InterviewSession.user_id == user_id)

    if status:
        query = query.filter(InterviewSession.status == status)

    return (
        query.order_by(InterviewSession.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_sessions_by_user(
    db: Session, user_id: int, status: Optional[SessionStatus] = None
) -> int:
    """Count sessions for a user."""
    query = db.query(InterviewSession).filter(InterviewSession.user_id == user_id)

    if status:
        query = query.filter(InterviewSession.status == status)

    return query.count()


def create_session(
    db: Session, user_id: int, session_in: InterviewSessionCreate
) -> InterviewSession:
    """Create a new interview session."""
    db_session = InterviewSession(
        user_id=user_id,
        topic=session_in.topic,
        difficulty=session_in.difficulty,
        role=session_in.role,
        skill_targets=session_in.skill_targets,
        question=session_in.question,
        question_context=session_in.question_context,
        status=SessionStatus.CREATED,
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def update_session(
    db: Session,
    db_session: InterviewSession,
    session_in: InterviewSessionUpdate,
) -> InterviewSession:
    """Update an interview session."""
    update_data = session_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_session, field, value)

    db_session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_session)
    return db_session


def submit_response(
    db: Session,
    db_session: InterviewSession,
    response: InterviewSessionSubmitResponse,
) -> InterviewSession:
    """Submit a response to an interview session."""
    if response.response_text:
        db_session.response_text = response.response_text
    if response.response_audio_url:
        db_session.response_audio_url = response.response_audio_url

    db_session.status = SessionStatus.AWAITING_FEEDBACK
    db_session.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(db_session)
    return db_session


def complete_session(
    db: Session, db_session: InterviewSession, score: Optional[int] = None
) -> InterviewSession:
    """Mark a session as completed."""
    db_session.status = SessionStatus.COMPLETED
    db_session.completed_at = datetime.utcnow()
    db_session.updated_at = datetime.utcnow()

    if score is not None:
        db_session.score = score

    db.commit()
    db.refresh(db_session)
    return db_session


def delete_session(db: Session, db_session: InterviewSession) -> bool:
    """Delete an interview session."""
    db.delete(db_session)
    db.commit()
    return True
