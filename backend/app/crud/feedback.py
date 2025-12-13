"""CRUD operations for feedback runs with ownership scoping."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.feedback import FeedbackRun, FeedbackStatus
from app.schemas.feedback import FeedbackRunCreate


def get_feedback_run(db: Session, feedback_id: int) -> Optional[FeedbackRun]:
    """Get a feedback run by ID."""
    return db.query(FeedbackRun).filter(FeedbackRun.id == feedback_id).first()


def get_feedback_run_by_user(
    db: Session, feedback_id: int, user_id: int
) -> Optional[FeedbackRun]:
    """Get a feedback run by ID with ownership check via session."""
    from app.models.interview_session import InterviewSession

    return (
        db.query(FeedbackRun)
        .join(InterviewSession)
        .filter(FeedbackRun.id == feedback_id, InterviewSession.user_id == user_id)
        .first()
    )


def get_feedback_runs_by_session(db: Session, session_id: int) -> list[FeedbackRun]:
    """Get all feedback runs for a session."""
    return (
        db.query(FeedbackRun)
        .filter(FeedbackRun.session_id == session_id)
        .order_by(FeedbackRun.created_at.desc())
        .all()
    )


def get_feedback_runs_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[FeedbackStatus] = None,
) -> list[FeedbackRun]:
    """Get all feedback runs for a user."""
    from app.models.interview_session import InterviewSession

    query = (
        db.query(FeedbackRun)
        .join(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
    )

    if status:
        query = query.filter(FeedbackRun.status == status)

    return query.order_by(FeedbackRun.created_at.desc()).offset(skip).limit(limit).all()


def count_feedback_runs_by_user(
    db: Session, user_id: int, status: Optional[FeedbackStatus] = None
) -> int:
    """Count feedback runs for a user."""
    from app.models.interview_session import InterviewSession

    query = (
        db.query(FeedbackRun)
        .join(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
    )

    if status:
        query = query.filter(FeedbackRun.status == status)

    return query.count()


def create_feedback_run(db: Session, feedback_in: FeedbackRunCreate) -> FeedbackRun:
    """Create a new feedback run."""
    db_feedback = FeedbackRun(
        session_id=feedback_in.session_id,
        rubric_id=feedback_in.rubric_id,
        status=FeedbackStatus.PENDING,
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def start_feedback_run(db: Session, db_feedback: FeedbackRun) -> FeedbackRun:
    """Mark a feedback run as started."""
    db_feedback.status = FeedbackStatus.PROCESSING
    db_feedback.started_at = datetime.utcnow()
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def complete_feedback_run(
    db: Session,
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
    """Complete a feedback run with results."""
    db_feedback.status = FeedbackStatus.COMPLETED
    db_feedback.completed_at = datetime.utcnow()
    db_feedback.overall_score = overall_score
    db_feedback.criterion_scores = criterion_scores
    db_feedback.strengths = strengths or []
    db_feedback.weaknesses = weaknesses or []
    db_feedback.suggestions = suggestions or []
    db_feedback.detailed_feedback = detailed_feedback
    db_feedback.model_name = model_name
    db_feedback.model_version = model_version
    db_feedback.prompt_id = prompt_id
    db_feedback.prompt_template_version = prompt_template_version
    db_feedback.latency_ms = latency_ms
    db_feedback.input_tokens = input_tokens
    db_feedback.output_tokens = output_tokens
    db_feedback.total_cost_usd = total_cost_usd

    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def fail_feedback_run(
    db: Session,
    db_feedback: FeedbackRun,
    error_message: str,
    content_filtered: bool = False,
    refusal_reason: Optional[str] = None,
    safety_flags: Optional[dict] = None,
) -> FeedbackRun:
    """Mark a feedback run as failed."""
    db_feedback.status = FeedbackStatus.FAILED
    db_feedback.completed_at = datetime.utcnow()
    db_feedback.error_message = error_message
    db_feedback.content_filtered = content_filtered
    db_feedback.refusal_reason = refusal_reason
    db_feedback.safety_flags = safety_flags
    db_feedback.retry_count += 1

    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def retry_feedback_run(db: Session, db_feedback: FeedbackRun) -> FeedbackRun:
    """Reset a failed feedback run for retry."""
    db_feedback.status = FeedbackStatus.PENDING
    db_feedback.started_at = None
    db_feedback.completed_at = None
    db_feedback.error_message = None

    db.commit()
    db.refresh(db_feedback)
    return db_feedback
