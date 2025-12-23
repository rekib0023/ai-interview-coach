import json
import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.core.dependencies import get_llm_service
from app.modules.feedback.crud import feedback as feedback_crud
from app.modules.llm.prompts import PracticePrompts
from app.modules.practices.models import (
    Practice,
    PracticeDifficulty,
    PracticeStatus,
    PracticeType,
)
from app.modules.practices.schemas import PracticeCreate, PracticeSubmitResponse

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
        try:
            db_feedback = feedback_crud.get(db=db, id=feedback_run_id)
            if not db_feedback:
                logger.error(f"Feedback run {feedback_run_id} not found")
                return

            if db_feedback.assessment.user_id != user_id:
                logger.error(
                    f"User {user_id} not authorized for feedback {feedback_run_id}"
                )
                return

            # Get weaknesses from feedback
            weaknesses = db_feedback.weaknesses or []
            if not weaknesses:
                logger.warning("No weaknesses identified, generating general practices")
                weaknesses = ["General practice needed"]

            # Get assessment info
            assessment = db_feedback.assessment

            # Generate prompt
            system_prompt = PracticePrompts.get_system_prompt()
            user_prompt = PracticePrompts.get_generation_prompt(
                weaknesses=weaknesses,
                topic=assessment.topic,
                count=count,
                difficulty_ramp=difficulty_ramp,
                skill_targets=assessment.skill_targets,
            )

            # Process using LLM service
            llm_service = get_llm_service()
            llm_response = await llm_service.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=2000,
            )

            # Parse response
            practices_data = self._parse_practices_response(llm_response.content)

            # Create practice records
            practice_creates = []
            for i, practice_data in enumerate(practices_data["practices"]):
                practice_type = self._parse_practice_type(
                    practice_data.get("practice_type", "practice_question")
                )
                difficulty = self._parse_practice_difficulty(
                    practice_data.get("difficulty", "medium")
                )

                practice_create = PracticeCreate(
                    feedback_run_id=db_feedback.id,
                    title=practice_data["title"],
                    prompt=practice_data["prompt"],
                    practice_type=practice_type,
                    difficulty=difficulty,
                    target_weakness=practice_data.get("target_weakness"),
                    target_skill=practice_data.get("target_skill"),
                    expected_answer=practice_data.get("expected_answer"),
                    hints=practice_data.get("hints"),
                    sequence_order=i,
                )
                practice_creates.append(practice_create)

            # Batch create practices
            practices = crud.practice.create_batch(
                db=db, user_id=user_id, practices_in=practice_creates
            )

            logger.info(
                f"Generated {len(practices)} practices for feedback {db_feedback.id}, "
                f"latency={llm_response.latency_ms}ms"
            )

        except Exception as e:
            logger.error(
                f"Error generating practices for feedback {feedback_run_id}: {e}"
            )

    def _parse_practices_response(self, content: str) -> dict[str, Any]:
        """Parse practices response from LLM."""
        try:
            content = content.strip()

            # Handle markdown code blocks
            if content.startswith("```"):
                lines = content.split("\n")
                content = "\n".join(lines[1:-1])

            data = json.loads(content)

            if "practices" not in data:
                raise ValueError("Missing practices in response")

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse drills response: {e}")
            raise ValueError(f"Invalid JSON in LLM response: {e}")

    def _parse_practice_type(self, practice_type_str: str) -> PracticeType:
        """Parse practice type string to enum."""
        mapping = {
            "practice_question": PracticeType.PRACTICE_QUESTION,
            "code_exercise": PracticeType.CODE_EXERCISE,
            "concept_review": PracticeType.CONCEPT_REVIEW,
            "mock_scenario": PracticeType.MOCK_SCENARIO,
        }
        return mapping.get(practice_type_str.lower(), PracticeType.PRACTICE_QUESTION)

    def _parse_practice_difficulty(self, difficulty_str: str) -> PracticeDifficulty:
        """Parse practice difficulty string to enum."""
        mapping = {
            "easy": PracticeDifficulty.EASY,
            "medium": PracticeDifficulty.MEDIUM,
            "hard": PracticeDifficulty.HARD,
        }
        return mapping.get(difficulty_str.lower(), PracticeDifficulty.MEDIUM)

    def get_practices_by_user(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
    ) -> list[Practice]:
        """Get practices for a user."""
        return crud.practice.get_multi_by_user(
            db=db, user_id=user_id, skip=skip, limit=limit, status=status
        )

    def count_practices_by_user(
        self, db: Session, user_id: int, status: Optional[str] = None
    ) -> int:
        """Count practices for a user."""
        return crud.practice.count_by_user(db=db, user_id=user_id, status=status)

    def get_pending_practices_by_user(
        self, db: Session, user_id: int, limit: int = 10
    ) -> list[Practice]:
        """Get pending practices for a user."""
        return crud.practice.get_pending_by_user(db=db, user_id=user_id, limit=limit)

    def get_practice_by_user(
        self, db: Session, practice_id: int, user_id: int
    ) -> Optional[Practice]:
        """Get a specific practice for a user."""
        return crud.practice.get_by_user(
            db=db, practice_id=practice_id, user_id=user_id
        )

    def deliver_practice(self, db: Session, db_practice: Practice) -> Practice:
        """Mark a practice as delivered."""
        return crud.practice.deliver(db=db, db_obj=db_practice)

    def start_practice(self, db: Session, db_practice: Practice) -> Practice:
        """Start a practice."""
        return crud.practice.start(db=db, db_obj=db_practice)

    def submit_practice_response(
        self, db: Session, db_practice: Practice, response: PracticeSubmitResponse
    ) -> Practice:
        """Submit a response for a practice."""
        return crud.practice.submit_response(
            db=db, db_obj=db_practice, response=response
        )

    def complete_practice(
        self, db: Session, db_practice: Practice, score: Optional[int] = None
    ) -> Practice:
        """Complete a practice."""
        return crud.practice.complete(db=db, db_obj=db_practice, score=score)

    def skip_practice(self, db: Session, db_practice: Practice) -> Practice:
        """Skip a practice."""
        return crud.practice.skip(db=db, db_obj=db_practice)

    def validate_for_start(self, db_practice: Practice) -> None:
        """
        Validate that a practice can be started.

        Args:
            db_practice: Practice to validate

        Raises:
            ValueError: If practice cannot be started
        """
        from app.shared.exceptions import ValidationError

        if db_practice.status not in [PracticeStatus.PENDING]:
            raise ValidationError(
                f"Cannot start practice with status: {db_practice.status}"
            )

    def validate_for_submit(self, db_practice: Practice) -> None:
        """
        Validate that a practice can accept submissions.

        Args:
            db_practice: Practice to validate

        Raises:
            ValueError: If practice cannot accept submissions
        """
        from app.shared.exceptions import ValidationError

        if db_practice.status in [PracticeStatus.COMPLETED, PracticeStatus.SKIPPED]:
            raise ValidationError(
                f"Cannot submit response for practice with status: {db_practice.status}"
            )

    def validate_for_complete(self, db_practice: Practice) -> None:
        """
        Validate that a practice can be completed.

        Args:
            db_practice: Practice to validate

        Raises:
            ValueError: If practice is already completed
        """
        from app.shared.exceptions import ValidationError

        if db_practice.status == PracticeStatus.COMPLETED:
            raise ValidationError("Practice is already completed")


def get_practice_service() -> PracticeService:
    """Dependency injection for PracticeService."""
    return PracticeService()
