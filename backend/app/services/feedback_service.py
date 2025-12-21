import logging

from sqlalchemy.orm import Session

from app import crud

logger = logging.getLogger(__name__)


class FeedbackService:
    async def generate_feedback(
        self,
        db: Session,
        feedback_run_id: int,
    ) -> None:
        """Background task to process feedback asynchronously."""
        from app.services.llm import LLMService

        try:
            db_feedback = crud.feedback.get(db=db, id=feedback_run_id)
            if not db_feedback:
                logger.error(f"Feedback run {feedback_run_id} not found")
                return

            # Get the assessment
            db_assessment = crud.assessment.get(db=db, id=db_feedback.assessment_id)
            if not db_assessment:
                crud.feedback.fail(
                    db=db,
                    db_feedback=db_feedback,
                    error_message="Assessment not found",
                )
                return

            # Process using LLM service
            llm_service = LLMService()
            await llm_service.generate_feedback(
                db=db,
                feedback_run=db_feedback,
                assessment=db_assessment,
            )

        except Exception as e:
            logger.error(f"Error processing feedback {feedback_run_id}: {e}")
            db_feedback = crud.feedback.get(db=db, id=feedback_run_id)
            if db_feedback:
                crud.feedback.fail(
                    db=db,
                    db_feedback=db_feedback,
                    error_message=str(e),
                )


feedback_service = FeedbackService()
