from datetime import datetime
from typing import List, Optional

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.shared.base_crud import CRUDBase

from .models import Assessment, AssessmentStatus
from .schemas import (
    AssessmentCreate,
    AssessmentSubmitResponse,
    AssessmentUpdate,
)


class CRUDAssessment(CRUDBase[Assessment, AssessmentCreate, AssessmentUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: AssessmentCreate, user_id: int
    ) -> Assessment:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(
            **obj_in_data, user_id=user_id, status=AssessmentStatus.CREATED
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(
        self, db: Session, *, user_id: int, id: int
    ) -> Optional[Assessment]:
        return (
            db.query(self.model)
            .filter(self.model.id == id, self.model.user_id == user_id)
            .first()
        )

    def get_multi_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[AssessmentStatus] = None,
    ) -> List[Assessment]:
        query = db.query(self.model).filter(self.model.user_id == user_id)
        if status:
            query = query.filter(self.model.status == status)
        return (
            query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        )

    def count_by_user(
        self, db: Session, *, user_id: int, status: Optional[AssessmentStatus] = None
    ) -> int:
        query = db.query(self.model).filter(self.model.user_id == user_id)
        if status:
            query = query.filter(self.model.status == status)
        return query.count()

    def submit_response(
        self,
        db: Session,
        *,
        db_assessment: Assessment,
        response: AssessmentSubmitResponse,
    ) -> Assessment:
        update_data = response.model_dump(exclude_unset=True)
        update_data["status"] = AssessmentStatus.AWAITING_FEEDBACK
        update_data["updated_at"] = datetime.utcnow()
        return self.update(db, db_obj=db_assessment, obj_in=update_data)

    def complete(
        self, db: Session, *, db_assessment: Assessment, score: Optional[int] = None
    ) -> Assessment:
        update_data = {
            "status": AssessmentStatus.COMPLETED,
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        if score is not None:
            update_data["score"] = score
        return self.update(db, db_obj=db_assessment, obj_in=update_data)


assessment = CRUDAssessment(Assessment)
