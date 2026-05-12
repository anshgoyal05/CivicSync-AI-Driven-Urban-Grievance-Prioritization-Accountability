from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    grievance_id: Mapped[int] = mapped_column(ForeignKey("grievances.id"), index=True, nullable=False)
    old_status: Mapped[str] = mapped_column(String(30), nullable=False)
    new_status: Mapped[str] = mapped_column(String(30), nullable=False)
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    grievance = relationship("Grievance", back_populates="audit_logs")
