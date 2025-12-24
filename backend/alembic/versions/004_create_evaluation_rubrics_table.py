"""Create evaluation_rubrics table

Revision ID: 004
Revises: 003
Create Date: 2025-12-24

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, Sequence[str], None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create evaluation_rubrics table."""
    op.create_table(
        "evaluation_rubrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("version", sa.String(length=50), nullable=False),
        sa.Column("criteria", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_evaluation_rubrics_id", "evaluation_rubrics", ["id"], unique=False
    )


def downgrade() -> None:
    """Drop evaluation_rubrics table."""
    op.drop_index("ix_evaluation_rubrics_id", table_name="evaluation_rubrics")
    op.drop_table("evaluation_rubrics")
