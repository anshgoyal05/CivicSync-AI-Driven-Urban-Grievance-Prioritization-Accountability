from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class GrievanceCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    category: str = Field(min_length=2, max_length=80)
    region_state: str = Field(min_length=2, max_length=80)
    region_city: str = Field(min_length=2, max_length=80)
    region_sector: str = Field(min_length=1, max_length=120)


class GrievanceResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    category: str
    region_state: str
    region_city: str
    region_sector: str
    latitude: float | None
    longitude: float | None
    image_path: str | None
    predicted_priority: str
    confidence_score: float
    ai_explanation: str
    department: str
    status: str
    created_at: datetime
    updated_at: datetime


class StatusUpdateRequest(BaseModel):
    new_status: str = Field(pattern="^(Pending|In Progress|Resolved)$")
