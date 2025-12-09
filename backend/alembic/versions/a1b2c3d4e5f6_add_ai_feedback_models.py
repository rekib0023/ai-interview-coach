"""Add AI feedback models

Revision ID: a1b2c3d4e5f6
Revises: 83356eac38bd
Create Date: 2025-12-09 10:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "83356eac38bd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define enum types using PostgreSQL ENUM (these won't auto-create during table creation)
rubriccategory = postgresql.ENUM(
    "system_design",
    "behavioral",
    "coding",
    "technical",
    "communication",
    name="rubriccategory",
    create_type=False,
)
feedbackstatus = postgresql.ENUM(
    "pending",
    "processing",
    "completed",
    "failed",
    name="feedbackstatus",
    create_type=False,
)
drilltype = postgresql.ENUM(
    "practice_question",
    "code_exercise",
    "concept_review",
    "mock_scenario",
    name="drilltype",
    create_type=False,
)
drilldifficulty = postgresql.ENUM(
    "easy", "medium", "hard", name="drilldifficulty", create_type=False
)
drillstatus = postgresql.ENUM(
    "pending",
    "in_progress",
    "completed",
    "skipped",
    name="drillstatus",
    create_type=False,
)
sessionstatus = postgresql.ENUM(
    "created",
    "in_progress",
    "awaiting_feedback",
    "completed",
    "cancelled",
    name="sessionstatus",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum types explicitly first
    op.execute(
        "CREATE TYPE rubriccategory AS ENUM ('system_design', 'behavioral', 'coding', 'technical', 'communication')"
    )
    op.execute(
        "CREATE TYPE feedbackstatus AS ENUM ('pending', 'processing', 'completed', 'failed')"
    )
    op.execute(
        "CREATE TYPE drilltype AS ENUM ('practice_question', 'code_exercise', 'concept_review', 'mock_scenario')"
    )
    op.execute("CREATE TYPE drilldifficulty AS ENUM ('easy', 'medium', 'hard')")
    op.execute(
        "CREATE TYPE drillstatus AS ENUM ('pending', 'in_progress', 'completed', 'skipped')"
    )
    op.execute(
        "CREATE TYPE sessionstatus AS ENUM ('created', 'in_progress', 'awaiting_feedback', 'completed', 'cancelled')"
    )

    # Create evaluation_rubric table
    op.create_table(
        "evaluation_rubric",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("version", sa.String(length=50), nullable=False),
        sa.Column("category", rubriccategory, nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("criteria", sa.JSON(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("passing_score", sa.Integer(), nullable=False, server_default="70"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_evaluation_rubric_id"), "evaluation_rubric", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_evaluation_rubric_name"), "evaluation_rubric", ["name"], unique=False
    )
    op.create_index(
        op.f("ix_evaluation_rubric_version"),
        "evaluation_rubric",
        ["version"],
        unique=False,
    )

    # Create feedback_run table
    op.create_table(
        "feedback_run",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("rubric_id", sa.Integer(), nullable=True),
        sa.Column("status", feedbackstatus, nullable=False, server_default="pending"),
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
        sa.Column(
            "content_filtered", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column("refusal_reason", sa.String(length=255), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("input_tokens", sa.Integer(), nullable=True),
        sa.Column("output_tokens", sa.Integer(), nullable=True),
        sa.Column("total_cost_usd", sa.Float(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["rubric_id"],
            ["evaluation_rubric.id"],
        ),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["interview_session.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_feedback_run_id"), "feedback_run", ["id"], unique=False)
    op.create_index(
        op.f("ix_feedback_run_session_id"), "feedback_run", ["session_id"], unique=False
    )
    op.create_index(
        op.f("ix_feedback_run_rubric_id"), "feedback_run", ["rubric_id"], unique=False
    )
    op.create_index(
        op.f("ix_feedback_run_prompt_id"), "feedback_run", ["prompt_id"], unique=False
    )

    # Create drill table
    op.create_table(
        "drill",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_run_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column(
            "drill_type", drilltype, nullable=False, server_default="practice_question"
        ),
        sa.Column(
            "difficulty", drilldifficulty, nullable=False, server_default="medium"
        ),
        sa.Column("target_weakness", sa.String(length=255), nullable=True),
        sa.Column("target_skill", sa.String(length=255), nullable=True),
        sa.Column("expected_answer", sa.Text(), nullable=True),
        sa.Column("hints", sa.Text(), nullable=True),
        sa.Column("status", drillstatus, nullable=False, server_default="pending"),
        sa.Column("is_delivered", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
        sa.Column("user_response", sa.Text(), nullable=True),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("sequence_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["feedback_run_id"],
            ["feedback_run.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_drill_id"), "drill", ["id"], unique=False)
    op.create_index(
        op.f("ix_drill_feedback_run_id"), "drill", ["feedback_run_id"], unique=False
    )
    op.create_index(op.f("ix_drill_user_id"), "drill", ["user_id"], unique=False)

    # Add new columns to interview_session table
    op.add_column(
        "interview_session",
        sa.Column("status", sessionstatus, nullable=True, server_default="created"),
    )
    op.add_column(
        "interview_session", sa.Column("role", sa.String(length=100), nullable=True)
    )
    op.add_column(
        "interview_session", sa.Column("skill_targets", sa.JSON(), nullable=True)
    )
    op.add_column("interview_session", sa.Column("question", sa.Text(), nullable=True))
    op.add_column(
        "interview_session", sa.Column("question_context", sa.Text(), nullable=True)
    )
    op.add_column(
        "interview_session",
        sa.Column("response_audio_url", sa.String(length=500), nullable=True),
    )
    op.add_column(
        "interview_session", sa.Column("response_text", sa.Text(), nullable=True)
    )
    op.add_column(
        "interview_session", sa.Column("transcript", sa.Text(), nullable=True)
    )
    op.add_column(
        "interview_session",
        sa.Column("transcript_status", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "interview_session", sa.Column("session_metadata", sa.JSON(), nullable=True)
    )
    op.add_column(
        "interview_session", sa.Column("updated_at", sa.DateTime(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Remove new columns from interview_session table
    op.drop_column("interview_session", "updated_at")
    op.drop_column("interview_session", "session_metadata")
    op.drop_column("interview_session", "transcript_status")
    op.drop_column("interview_session", "transcript")
    op.drop_column("interview_session", "response_text")
    op.drop_column("interview_session", "response_audio_url")
    op.drop_column("interview_session", "question_context")
    op.drop_column("interview_session", "question")
    op.drop_column("interview_session", "skill_targets")
    op.drop_column("interview_session", "role")
    op.drop_column("interview_session", "status")

    # Drop drill table
    op.drop_index(op.f("ix_drill_user_id"), table_name="drill")
    op.drop_index(op.f("ix_drill_feedback_run_id"), table_name="drill")
    op.drop_index(op.f("ix_drill_id"), table_name="drill")
    op.drop_table("drill")

    # Drop feedback_run table
    op.drop_index(op.f("ix_feedback_run_prompt_id"), table_name="feedback_run")
    op.drop_index(op.f("ix_feedback_run_rubric_id"), table_name="feedback_run")
    op.drop_index(op.f("ix_feedback_run_session_id"), table_name="feedback_run")
    op.drop_index(op.f("ix_feedback_run_id"), table_name="feedback_run")
    op.drop_table("feedback_run")

    # Drop evaluation_rubric table
    op.drop_index(op.f("ix_evaluation_rubric_version"), table_name="evaluation_rubric")
    op.drop_index(op.f("ix_evaluation_rubric_name"), table_name="evaluation_rubric")
    op.drop_index(op.f("ix_evaluation_rubric_id"), table_name="evaluation_rubric")
    op.drop_table("evaluation_rubric")

    # Drop enum types
    op.execute("DROP TYPE IF EXISTS sessionstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS drillstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS drilldifficulty CASCADE")
    op.execute("DROP TYPE IF EXISTS drilltype CASCADE")
    op.execute("DROP TYPE IF EXISTS feedbackstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS rubriccategory CASCADE")
