from __future__ import annotations

from pydantic import BaseModel


class CountItem(BaseModel):
    label: str
    count: int


class MonthlyTrendItem(BaseModel):
    month: str  # YYYY-MM
    count: int


class AnalyticsResponse(BaseModel):
    complaints_by_region: list[CountItem]
    complaints_by_priority: list[CountItem]
    complaints_by_department: list[CountItem]
    monthly_trend: list[MonthlyTrendItem]
