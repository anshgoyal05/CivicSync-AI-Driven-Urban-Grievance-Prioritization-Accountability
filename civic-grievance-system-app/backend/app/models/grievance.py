from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Grievance(Base):
    __tablename__ = "grievances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)

    region_state: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    region_city: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    region_sector: Mapped[str] = mapped_column(String(120), index=True, nullable=False)

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    predicted_priority: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    ai_explanation: Mapped[str] = mapped_column(Text, nullable=False)

    department: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(20), index=True, nullable=False, default="Pending")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", back_populates="grievances")
    audit_logs = relationship("AuditLog", back_populates="grievance", cascade="all,delete-orphan")

