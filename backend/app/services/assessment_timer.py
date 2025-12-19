"""Assessment timer management service."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.assessment import Assessment, AssessmentStatus

logger = logging.getLogger(__name__)


class AssessmentTimerService:
    """Service for managing assessment timers and automatic expiration."""

    def __init__(self):
        self.active_timers: dict[int, asyncio.Task] = {}

    async def start_timer(
        self,
        assessment_id: int,
        duration_minutes: int,
    ) -> None:
        """Start a timer for an assessment."""
        # Cancel existing timer if any
        if assessment_id in self.active_timers:
            self.active_timers[assessment_id].cancel()

        # Create new timer task
        timer_task = asyncio.create_task(
            self._timer_task(assessment_id, duration_minutes)
        )
        self.active_timers[assessment_id] = timer_task

        logger.info(
            f"Started timer for assessment {assessment_id}: {duration_minutes} minutes"
        )

    async def stop_timer(self, assessment_id: int) -> None:
        """Stop the timer for an assessment."""
        if assessment_id in self.active_timers:
            self.active_timers[assessment_id].cancel()
            del self.active_timers[assessment_id]
            logger.info(f"Stopped timer for assessment {assessment_id}")

    async def _timer_task(self, assessment_id: int, duration_minutes: int) -> None:
        """Background task that expires an assessment after duration."""
        try:
            # Wait for the duration
            await asyncio.sleep(duration_minutes * 60)

            # Expire the assessment
            db: Session = SessionLocal()
            try:
                assessment = (
                    db.query(Assessment).filter(Assessment.id == assessment_id).first()
                )

                if assessment and assessment.status == AssessmentStatus.IN_PROGRESS:
                    assessment.status = AssessmentStatus.COMPLETED
                    assessment.completed_at = datetime.utcnow()
                    db.commit()
                    logger.info(
                        f"Assessment {assessment_id} expired after {duration_minutes} minutes"
                    )

            finally:
                db.close()

        except asyncio.CancelledError:
            logger.info(f"Timer for assessment {assessment_id} was cancelled")
        except Exception as e:
            logger.error(f"Error in timer task for assessment {assessment_id}: {e}")
        finally:
            # Clean up
            if assessment_id in self.active_timers:
                del self.active_timers[assessment_id]

    def get_remaining_time(self, assessment: Assessment) -> Optional[int]:
        """Get remaining time in seconds for an assessment."""
        if not assessment.started_at:
            return None

        # Calculate duration from assessment metadata or default
        duration_minutes = assessment.duration_minutes or 45
        end_time = assessment.started_at + timedelta(minutes=duration_minutes)

        if assessment.completed_at:
            return 0

        remaining = (end_time - datetime.utcnow()).total_seconds()
        return max(0, int(remaining))


# Singleton instance
assessment_timer_service = AssessmentTimerService()
