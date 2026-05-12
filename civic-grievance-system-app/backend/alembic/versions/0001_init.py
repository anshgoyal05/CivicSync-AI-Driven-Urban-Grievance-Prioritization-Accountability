"""init

Revision ID: 0001_init
Revises: 
Create Date: 2026-03-06
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False, server_default="user"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "grievances",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("region_state", sa.String(length=80), nullable=False),
        sa.Column("region_city", sa.String(length=80), nullable=False),
        sa.Column("region_sector", sa.String(length=120), nullable=False),
        sa.Column("image_path", sa.String(length=500), nullable=True),
        sa.Column("predicted_priority", sa.String(length=20), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("ai_explanation", sa.Text(), nullable=False),
        sa.Column("department", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="Pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_grievances_user_id", "grievances", ["user_id"])
    op.create_index("ix_grievances_state", "grievances", ["region_state"])
    op.create_index("ix_grievances_city", "grievances", ["region_city"])
    op.create_index("ix_grievances_sector", "grievances", ["region_sector"])
    op.create_index("ix_grievances_priority", "grievances", ["predicted_priority"])
    op.create_index("ix_grievances_status", "grievances", ["status"])
    op.create_index("ix_grievances_department", "grievances", ["department"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("grievance_id", sa.Integer(), sa.ForeignKey("grievances.id"), nullable=False),
        sa.Column("old_status", sa.String(length=30), nullable=False),
        sa.Column("new_status", sa.String(length=30), nullable=False),
        sa.Column("changed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_audit_logs_grievance_id", "audit_logs", ["grievance_id"])
    op.create_index("ix_audit_logs_changed_by", "audit_logs", ["changed_by"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_changed_by", table_name="audit_logs")
    op.drop_index("ix_audit_logs_grievance_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_grievances_department", table_name="grievances")
    op.drop_index("ix_grievances_status", table_name="grievances")
    op.drop_index("ix_grievances_priority", table_name="grievances")
    op.drop_index("ix_grievances_sector", table_name="grievances")
    op.drop_index("ix_grievances_city", table_name="grievances")
    op.drop_index("ix_grievances_state", table_name="grievances")
    op.drop_index("ix_grievances_user_id", table_name="grievances")
    op.drop_table("grievances")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

