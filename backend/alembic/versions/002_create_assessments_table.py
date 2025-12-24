"""Create assessments table

Revision ID: 002
Revises: 001
Create Date: 2025-12-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, Sequence[str], None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create assessments table."""
    op.create_table(
        "assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=100), nullable=True),
        sa.Column(
            "difficulty",
            sa.Enum("Easy", "Medium", "Hard", name="difficultylevel"),
            nullable=False,
        ),
        sa.Column("skill_targets", sa.JSON(), nullable=True),
        sa.Column("question", sa.Text(), nullable=True),
        sa.Column("question_context", sa.Text(), nullable=True),
        sa.Column("response_text", sa.Text(), nullable=True),
        sa.Column("response_audio_url", sa.String(length=500), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("transcript_status", sa.String(length=50), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "created",
                "in_progress",
                "awaiting_feedback",
                "completed",
                "cancelled",
                name="assessmentstatus",
            ),
            nullable=False,
        ),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("session_metadata", sa.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assessments_id", "assessments", ["id"], unique=False)
    op.create_index("ix_assessments_user_id", "assessments", ["user_id"], unique=False)


def downgrade() -> None:
    """Drop assessments table."""
    op.drop_index("ix_assessments_user_id", table_name="assessments")
    op.drop_index("ix_assessments_id", table_name="assessments")
    op.drop_table("assessments")
    op.execute("DROP TYPE IF EXISTS difficultylevel")
    op.execute("DROP TYPE IF EXISTS assessmentstatus")
