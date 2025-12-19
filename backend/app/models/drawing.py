"""Drawing model for storing Excalidraw diagrams."""

from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Drawing(Base):
    """Model for storing Excalidraw drawing JSON data."""

    __tablename__ = "drawing"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer, ForeignKey("assessment.id"), nullable=False, index=True
    )
    drawing_json = Column(JSON, nullable=False)  # Excalidraw JSON format
    title = Column(String(255), nullable=True)  # Optional title/description
    version = Column(String(50), default="1.0.0", nullable=False)  # Excalidraw version

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    assessment = relationship("Assessment", backref="drawings")
