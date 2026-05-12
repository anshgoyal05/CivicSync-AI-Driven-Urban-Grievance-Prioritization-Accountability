from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import admin, analytics, auth, grievances, regions

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(regions.router, prefix="/regions", tags=["regions"])
api_router.include_router(grievances.router, prefix="/grievances", tags=["grievances"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

