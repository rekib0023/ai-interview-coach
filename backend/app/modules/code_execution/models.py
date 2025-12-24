"""Code submission model for storing code execution results."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.shared.base_model import Base, UUIDMixin


class CodeLanguage(str, PyEnum):
    """Supported programming languages."""

    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"


class CodeSubmission(UUIDMixin, Base):
    """Model for storing code submissions and execution results."""

    __tablename__ = "code_submissions"

    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    language = Column(
        Enum(CodeLanguage, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    code_text = Column(Text, nullable=False)
    result_output = Column(Text, nullable=True)
    error_output = Column(Text, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    memory_used_mb = Column(Integer, nullable=True)
    exit_code = Column(Integer, nullable=True)
    timed_out = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="code_submissions")
