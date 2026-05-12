from __future__ import annotations

from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401


def init_db() -> None:
    # For local/dev environments without Alembic/Postgres installed.
    Base.metadata.create_all(bind=engine)

