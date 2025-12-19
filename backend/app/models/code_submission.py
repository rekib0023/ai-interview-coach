"""Code submission model for storing code execution results."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class CodeLanguage(str, PyEnum):
    """Supported programming languages."""

    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"


class CodeSubmission(Base):
    """Model for storing code submissions and execution results."""

    __tablename__ = "code_submission"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer, ForeignKey("assessment.id"), nullable=False, index=True
    )
    language = Column(
        Enum(CodeLanguage, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    code_text = Column(Text, nullable=False)
    result_output = Column(Text, nullable=True)  # stdout
    error_output = Column(Text, nullable=True)  # stderr
    execution_time_ms = Column(Integer, nullable=True)  # Execution time in milliseconds
    memory_used_mb = Column(Integer, nullable=True)  # Memory used in MB
    exit_code = Column(Integer, nullable=True)  # Process exit code
    timed_out = Column(
        Boolean, default=False, nullable=False
    )  # Whether execution timed out

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", backref="code_submissions")
