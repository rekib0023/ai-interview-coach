"""Create practices table

Revision ID: 006
Revises: 005
Create Date: 2025-12-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "006"
down_revision: Union[str, Sequence[str], None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create practices table."""
    op.create_table(
        "practices",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("feedback_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column(
            "practice_type",
            sa.Enum(
                "practice_question",
                "code_exercise",
                "concept_review",
                "mock_scenario",
                name="practicetype",
            ),
            nullable=False,
        ),
        sa.Column(
            "difficulty",
            sa.Enum("easy", "medium", "hard", name="practicedifficulty"),
            nullable=False,
        ),
        sa.Column("target_weakness", sa.String(length=255), nullable=True),
        sa.Column("target_skill", sa.String(length=255), nullable=True),
        sa.Column("expected_answer", sa.Text(), nullable=True),
        sa.Column("hints", sa.JSON(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "pending", "in_progress", "completed", "skipped", name="practicestatus"
            ),
            nullable=False,
        ),
        sa.Column("is_delivered", sa.Boolean(), nullable=False, default=False),
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
        sa.Column("user_response", sa.Text(), nullable=True),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("sequence_order", sa.Integer(), nullable=False, default=0),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["feedback_run_id"], ["feedback_runs.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_practices_id", "practices", ["id"], unique=False)
    op.create_index(
        "ix_practices_feedback_run_id", "practices", ["feedback_run_id"], unique=False
    )
    op.create_index("ix_practices_user_id", "practices", ["user_id"], unique=False)


def downgrade() -> None:
    """Drop practices table."""
    op.drop_index("ix_practices_user_id", table_name="practices")
    op.drop_index("ix_practices_feedback_run_id", table_name="practices")
    op.drop_index("ix_practices_id", table_name="practices")
    op.drop_table("practices")
    op.execute("DROP TYPE IF EXISTS practicetype")
    op.execute("DROP TYPE IF EXISTS practicedifficulty")
    op.execute("DROP TYPE IF EXISTS practicestatus")
