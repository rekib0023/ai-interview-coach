"""Create code_submissions table

Revision ID: 003
Revises: 002
Create Date: 2025-12-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, Sequence[str], None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create code_submissions table."""
    op.create_table(
        "code_submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assessment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "language",
            sa.Enum("python", "javascript", "typescript", name="codelanguage"),
            nullable=False,
        ),
        sa.Column("code_text", sa.Text(), nullable=False),
        sa.Column("result_output", sa.Text(), nullable=True),
        sa.Column("error_output", sa.Text(), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("memory_used_mb", sa.Integer(), nullable=True),
        sa.Column("exit_code", sa.Integer(), nullable=True),
        sa.Column("timed_out", sa.Boolean(), nullable=False, default=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["assessment_id"], ["assessments.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_code_submissions_id", "code_submissions", ["id"], unique=False)
    op.create_index(
        "ix_code_submissions_assessment_id",
        "code_submissions",
        ["assessment_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop code_submissions table."""
    op.drop_index("ix_code_submissions_assessment_id", table_name="code_submissions")
    op.drop_index("ix_code_submissions_id", table_name="code_submissions")
    op.drop_table("code_submissions")
    op.execute("DROP TYPE IF EXISTS codelanguage")
