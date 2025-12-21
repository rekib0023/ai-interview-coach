import logging

from sqlalchemy.orm import Session

from . import crud

logger = logging.getLogger(__name__)


class PracticeService:
    async def generate_practices_from_feedback(
        self,
        db: Session,
        feedback_run_id: int,
        user_id: int,
        count: int,
        difficulty_ramp: bool,
    ) -> None:
        """Background task to generate practices asynchronously."""
        from app.modules.llm.service import LLMService

        try:
            db_feedback = crud.feedback.get(db=db, id=feedback_run_id)
            if not db_feedback:
                logger.error(f"Feedback run {feedback_run_id} not found")
                return

            if db_feedback.assessment.user_id != user_id:
                logger.error(
                    f"User {user_id} not authorized for feedback {feedback_run_id}"
                )
                return

            llm_service = LLMService()
            await llm_service.generate_practices(
                db=db,
                feedback_run=db_feedback,
                user_id=user_id,
                count=count,
                difficulty_ramp=difficulty_ramp,
            )

        except Exception as e:
            logger.error(
                f"Error generating practices for feedback {feedback_run_id}: {e}"
            )


practice_service = PracticeService()
