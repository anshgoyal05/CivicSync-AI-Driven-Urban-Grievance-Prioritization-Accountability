"""add latitude longitude to grievances

Revision ID: 0002_add_lat_lng
Revises: 0001_init
Create Date: 2026-03-06

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0002_add_lat_lng"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("grievances", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("grievances", sa.Column("longitude", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("grievances", "longitude")
    op.drop_column("grievances", "latitude")
