"""CRUD operations for websocket messages."""

from typing import List

from sqlalchemy.orm import Session

from app.shared.base_crud import CRUDBase

from .models import Message
from .schemas import MessageCreate


class CRUDMessage(CRUDBase[Message, MessageCreate, dict]):
    """CRUD operations for Message model."""

    def get_by_assessment(self, db: Session, *, assessment_id: int) -> List[Message]:
        """Get all messages for an assessment."""
        return (
            db.query(self.model)
            .filter(self.model.assessment_id == assessment_id)
            .order_by(self.model.created_at)
            .all()
        )


message = CRUDMessage(Message)
