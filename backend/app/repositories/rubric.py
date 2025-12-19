"""Repository for evaluation rubrics."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.rubric import EvaluationRubric, RubricCategory
from app.repositories.base import BaseRepository
from app.schemas.rubric import EvaluationRubricCreate, EvaluationRubricUpdate


class RubricRepository(
    BaseRepository[EvaluationRubric, EvaluationRubricCreate, EvaluationRubricUpdate]
):
    """Repository for evaluation rubric operations."""

    def __init__(self):
        super().__init__(EvaluationRubric)

    def create_rubric(
        self, db: Session, *, rubric_in: EvaluationRubricCreate
    ) -> EvaluationRubric:
        """Create a new evaluation rubric."""
        # Convert criteria to JSON-serializable format
        criteria_data = [criterion.model_dump() for criterion in rubric_in.criteria]

        db_rubric = EvaluationRubric(
            name=rubric_in.name,
            version=rubric_in.version,
            category=rubric_in.category,
            description=rubric_in.description,
            criteria=criteria_data,
            max_score=rubric_in.max_score,
            passing_score=rubric_in.passing_score,
        )
        db.add(db_rubric)
        db.commit()
        db.refresh(db_rubric)
        return db_rubric

    def get_by_name_version(
        self, db: Session, *, name: str, version: str
    ) -> Optional[EvaluationRubric]:
        """Get a rubric by name and version."""
        return (
            db.query(EvaluationRubric)
            .filter(EvaluationRubric.name == name, EvaluationRubric.version == version)
            .first()
        )

    def get_active_by_category(
        self, db: Session, *, category: RubricCategory
    ) -> Optional[EvaluationRubric]:
        """Get the latest active rubric for a category."""
        return (
            db.query(EvaluationRubric)
            .filter(
                EvaluationRubric.category == category,
                EvaluationRubric.is_active == True,  # noqa: E712
            )
            .order_by(EvaluationRubric.created_at.desc())
            .first()
        )

    def get_all(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 20,
        category: Optional[RubricCategory] = None,
        is_active: Optional[bool] = None,
    ) -> List[EvaluationRubric]:
        """Get rubrics with optional filtering."""
        query = db.query(EvaluationRubric)

        if category:
            query = query.filter(EvaluationRubric.category == category)
        if is_active is not None:
            query = query.filter(EvaluationRubric.is_active == is_active)

        return (
            query.order_by(EvaluationRubric.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(
        self,
        db: Session,
        *,
        category: Optional[RubricCategory] = None,
        is_active: Optional[bool] = None,
    ) -> int:
        """Count rubrics with optional filtering."""
        query = db.query(EvaluationRubric)

        if category:
            query = query.filter(EvaluationRubric.category == category)
        if is_active is not None:
            query = query.filter(EvaluationRubric.is_active == is_active)

        return query.count()

    def update_rubric(
        self,
        db: Session,
        *,
        rubric: EvaluationRubric,
        rubric_in: EvaluationRubricUpdate,
    ) -> EvaluationRubric:
        """Update an evaluation rubric."""
        update_data = rubric_in.model_dump(exclude_unset=True)

        # Handle criteria conversion if present
        if "criteria" in update_data and update_data["criteria"]:
            update_data["criteria"] = [c.model_dump() for c in rubric_in.criteria]

        for field, value in update_data.items():
            setattr(rubric, field, value)

        rubric.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(rubric)
        return rubric

    def deactivate(self, db: Session, *, rubric: EvaluationRubric) -> EvaluationRubric:
        """Deactivate a rubric."""
        rubric.is_active = False
        rubric.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(rubric)
        return rubric


# Singleton instance
rubric_repository = RubricRepository()
