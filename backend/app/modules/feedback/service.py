import json
import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.core.dependencies import get_llm_service
from app.modules.assessments.crud import assessment as assessment_crud
from app.modules.feedback.models import FeedbackRun, FeedbackStatus
from app.modules.feedback.schemas import FeedbackRunCreate
from app.modules.llm.prompts import FeedbackPrompts, generate_prompt_id
from app.shared.exceptions import BusinessLogicError, NotFoundError

from . import crud

logger = logging.getLogger(__name__)


class FeedbackService:
    async def generate_feedback(
        self,
        db: Session,
        feedback_run_id: int,
    ) -> None:
        """Background task to process feedback asynchronously."""
        try:
            db_feedback = crud.feedback.get(db=db, id=feedback_run_id)
            if not db_feedback:
                logger.error(f"Feedback run {feedback_run_id} not found")
                return

            # Get the assessment
            db_assessment = assessment_crud.get(db=db, id=db_feedback.assessment_id)
            if not db_assessment:
                crud.feedback.fail(
                    db=db,
                    db_feedback=db_feedback,
                    error_message="Assessment not found",
                )
                return

            # Mark as processing
            feedback_run = crud.feedback.start_feedback_run(
                db=db, db_feedback=db_feedback
            )

            # Get response text
            response_text = db_assessment.response_text
            if not response_text:
                raise ValueError("No response text available for feedback")

            # Get question
            question = (
                db_assessment.question
                or f"Interview question about {db_assessment.topic}"
            )

            # Get rubric criteria if available
            rubric_criteria = None
            if feedback_run.rubric:
                rubric_criteria = feedback_run.rubric.criteria

            # Generate prompt
            prompt_id = generate_prompt_id("feedback", FeedbackPrompts.VERSION)
            system_prompt = FeedbackPrompts.get_system_prompt()
            user_prompt = FeedbackPrompts.get_user_prompt(
                question=question,
                response_text=response_text,
                topic=db_assessment.topic,
                difficulty=db_assessment.difficulty.value,
                role=db_assessment.role,
                skill_targets=db_assessment.skill_targets,
                rubric_criteria=rubric_criteria,
            )

            # Process using LLM service
            llm_service = get_llm_service()
            llm_response = await llm_service.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.5,
                max_tokens=2000,
            )

            # Parse response
            feedback_data = self._parse_feedback_response(llm_response.content)

            # Update feedback run with results
            crud.feedback.complete(
                db=db,
                db_feedback=feedback_run,
                overall_score=feedback_data["overall_score"],
                criterion_scores=feedback_data.get("criterion_scores"),
                strengths=feedback_data.get("strengths"),
                weaknesses=feedback_data.get("weaknesses"),
                suggestions=feedback_data.get("suggestions"),
                detailed_feedback=feedback_data.get("detailed_feedback"),
                model_name=llm_response.model,
                prompt_id=prompt_id,
                prompt_template_version=FeedbackPrompts.VERSION,
                latency_ms=llm_response.latency_ms,
                input_tokens=llm_response.input_tokens,
                output_tokens=llm_response.output_tokens,
                total_cost_usd=llm_response.cost_usd,
            )

            logger.info(
                f"Feedback generated for assessment {db_assessment.id}: "
                f"score={feedback_data['overall_score']}, "
                f"latency={llm_response.latency_ms}ms"
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

    def _parse_feedback_response(self, content: str) -> dict[str, Any]:
        """Parse feedback response from LLM."""
        try:
            # Try to extract JSON from response
            content = content.strip()

            # Handle markdown code blocks
            if content.startswith("```"):
                lines = content.split("\n")
                # Remove first and last lines (```json and ```)
                content = "\n".join(lines[1:-1])

            data = json.loads(content)

            # Validate required fields
            if "overall_score" not in data:
                raise ValueError("Missing overall_score in response")

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse feedback response: {e}")
            logger.error(f"Response content: {content[:500]}...")
            raise ValueError(f"Invalid JSON in LLM response: {e}")

    def create_feedback_run(
        self,
        db: Session,
        assessment_id: int,
        user_id: int,
        rubric_id: Optional[int] = None,
    ) -> FeedbackRun:
        """Create a new feedback run."""
        # Verify assessment ownership
        db_assessment = assessment_crud.get_by_user(
            db=db, id=assessment_id, user_id=user_id
        )

        if not db_assessment:
            raise NotFoundError("Assessment not found")

        # Validate assessment has a response
        if not db_assessment.response_text and not db_assessment.response_audio_url:
            raise BusinessLogicError(
                "Assessment has no response to evaluate. Submit a response first."
            )

        feedback_in = FeedbackRunCreate(
            assessment_id=assessment_id,
            rubric_id=rubric_id,
        )

        return crud.feedback.create(db=db, obj_in=feedback_in)

    def get_feedback_run(
        self, db: Session, feedback_id: int, user_id: int
    ) -> FeedbackRun:
        """Get a feedback run."""
        db_feedback = crud.feedback.get_by_user(
            db=db, feedback_id=feedback_id, user_id=user_id
        )
        if not db_feedback:
            raise NotFoundError("Feedback run not found")
        return db_feedback

    def list_feedback_runs(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
    ):
        """List feedback runs."""
        return crud.feedback.get_multi_by_user(
            db=db,
            user_id=user_id,
            skip=skip,
            limit=limit,
            status=status,
        )

    def count_feedback_runs(
        self, db: Session, user_id: int, status: Optional[str] = None
    ) -> int:
        """Count feedback runs."""
        return crud.feedback.count_by_user(db=db, user_id=user_id, status=status)

    def retry_feedback_run(
        self, db: Session, feedback_id: int, user_id: int
    ) -> FeedbackRun:
        """Retry a failed feedback run."""
        db_feedback = self.get_feedback_run(
            db=db, feedback_id=feedback_id, user_id=user_id
        )

        if db_feedback.status != FeedbackStatus.FAILED:
            raise BusinessLogicError("Can only retry failed feedback runs")

        if db_feedback.retry_count >= 3:
            raise BusinessLogicError("Maximum retry attempts reached")

        return crud.feedback.retry(db=db, db_feedback=db_feedback)

    def get_status_info(
        self, status: str, error_message: Optional[str] = None
    ) -> tuple[str, int]:
        """Get status info."""
        estimated_seconds = None
        progress_message = None

        if status == FeedbackStatus.PENDING:
            progress_message = "Waiting to start processing"
            estimated_seconds = 10
        elif status == FeedbackStatus.PROCESSING:
            progress_message = "Analyzing response and generating feedback"
            estimated_seconds = 5
        elif status == FeedbackStatus.COMPLETED:
            progress_message = "Feedback ready"
            estimated_seconds = 0
        elif status == FeedbackStatus.FAILED:
            progress_message = f"Failed: {error_message or 'Unknown error'}"

        return progress_message, estimated_seconds
