"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-13
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("open_id", sa.String(length=128), nullable=False, unique=True),
        sa.Column("nickname", sa.String(length=128), nullable=False, server_default="微信用户"),
        sa.Column("avatar_url", sa.Text(), nullable=False, server_default=""),
        sa.Column("bio", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "flags",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(length=256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("category", sa.String(length=128), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("target_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("cover", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("target_date >= start_date", name="ck_flags_target_after_start"),
        sa.CheckConstraint(
            "status IN ('active','paused','completed','abandoned')",
            name="ck_flags_status",
        ),
    )
    op.create_index("ix_flags_user_status", "flags", ["user_id", "status"])

    op.create_table(
        "stages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "flag_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("flags.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=256), nullable=False),
        sa.Column("goal", sa.Text(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("checkin_frequency", sa.String(length=64), nullable=False),
        sa.Column("reward", sa.Text(), nullable=False, server_default=""),
        sa.Column("punishment", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("end_date >= start_date", name="ck_stages_end_after_start"),
        sa.CheckConstraint(
            "status IN ('pending','active','completed','failed')",
            name="ck_stages_status",
        ),
    )
    op.create_index("ix_stages_flag_status", "stages", ["flag_id", "status"])

    op.create_table(
        "checkins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "flag_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("flags.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "stage_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("images", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("mood", sa.String(length=32), nullable=False),
        sa.Column("checkin_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_checkins_user_date", "checkins", ["user_id", "checkin_date"])
    op.create_index("ix_checkins_flag_date", "checkins", ["flag_id", "checkin_date"])
    op.create_index("ix_checkins_stage_date", "checkins", ["stage_id", "checkin_date"])


def downgrade() -> None:
    op.drop_index("ix_checkins_stage_date", table_name="checkins")
    op.drop_index("ix_checkins_flag_date", table_name="checkins")
    op.drop_index("ix_checkins_user_date", table_name="checkins")
    op.drop_table("checkins")
    op.drop_index("ix_stages_flag_status", table_name="stages")
    op.drop_table("stages")
    op.drop_index("ix_flags_user_status", table_name="flags")
    op.drop_table("flags")
    op.drop_table("users")
