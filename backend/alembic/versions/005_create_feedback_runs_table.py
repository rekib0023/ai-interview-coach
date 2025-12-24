"""Create feedback_runs table

Revision ID: 005
Revises: 004
Create Date: 2025-12-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: Union[str, Sequence[str], None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create feedback_runs table."""
    op.create_table(
        "feedback_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assessment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rubric_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "pending", "processing", "completed", "failed", name="feedbackstatus"
            ),
            nullable=False,
        ),
        sa.Column("model_name", sa.String(length=100), nullable=True),
        sa.Column("model_version", sa.String(length=50), nullable=True),
        sa.Column("prompt_id", sa.String(length=100), nullable=True),
        sa.Column("prompt_template_version", sa.String(length=50), nullable=True),
        sa.Column("overall_score", sa.Integer(), nullable=True),
        sa.Column("criterion_scores", sa.JSON(), nullable=True),
        sa.Column("strengths", sa.JSON(), nullable=True),
        sa.Column("weaknesses", sa.JSON(), nullable=True),
        sa.Column("suggestions", sa.JSON(), nullable=True),
        sa.Column("detailed_feedback", sa.Text(), nullable=True),
        sa.Column("safety_flags", sa.JSON(), nullable=True),
        sa.Column("content_filtered", sa.Boolean(), nullable=False, default=False),
        sa.Column("refusal_reason", sa.String(length=255), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("input_tokens", sa.Integer(), nullable=True),
        sa.Column("output_tokens", sa.Integer(), nullable=True),
        sa.Column("total_cost_usd", sa.Float(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, default=0),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["assessment_id"], ["assessments.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["rubric_id"], ["evaluation_rubrics.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_feedback_runs_id", "feedback_runs", ["id"], unique=False)
    op.create_index(
        "ix_feedback_runs_assessment_id",
        "feedback_runs",
        ["assessment_id"],
        unique=False,
    )
    op.create_index(
        "ix_feedback_runs_rubric_id", "feedback_runs", ["rubric_id"], unique=False
    )
    op.create_index(
        "ix_feedback_runs_prompt_id", "feedback_runs", ["prompt_id"], unique=False
    )


def downgrade() -> None:
    """Drop feedback_runs table."""
    op.drop_index("ix_feedback_runs_prompt_id", table_name="feedback_runs")
    op.drop_index("ix_feedback_runs_rubric_id", table_name="feedback_runs")
    op.drop_index("ix_feedback_runs_assessment_id", table_name="feedback_runs")
    op.drop_index("ix_feedback_runs_id", table_name="feedback_runs")
    op.drop_table("feedback_runs")
    op.execute("DROP TYPE IF EXISTS feedbackstatus")
