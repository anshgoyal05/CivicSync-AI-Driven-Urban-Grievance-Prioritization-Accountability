from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import engine, get_db
from app.models.grievance import Grievance
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse, CountItem, MonthlyTrendItem

router = APIRouter()


@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    by_region_rows = (
        db.query(Grievance.region_state, func.count(Grievance.id))
        .group_by(Grievance.region_state)
        .order_by(func.count(Grievance.id).desc())
        .all()
    )
    by_priority_rows = (
        db.query(Grievance.predicted_priority, func.count(Grievance.id))
        .group_by(Grievance.predicted_priority)
        .order_by(func.count(Grievance.id).desc())
        .all()
    )
    by_dept_rows = (
        db.query(Grievance.department, func.count(Grievance.id))
        .group_by(Grievance.department)
        .order_by(func.count(Grievance.id).desc())
        .all()
    )

    if engine.dialect.name == "sqlite":
        month_expr = func.strftime("%Y-%m", Grievance.created_at)
    else:
        month_expr = func.to_char(Grievance.created_at, "YYYY-MM")
    monthly_rows = (
        db.query(month_expr.label("month"), func.count(Grievance.id))
        .group_by("month")
        .order_by("month")
        .all()
    )

    return AnalyticsResponse(
        complaints_by_region=[CountItem(label=r[0], count=int(r[1])) for r in by_region_rows],
        complaints_by_priority=[CountItem(label=r[0], count=int(r[1])) for r in by_priority_rows],
        complaints_by_department=[CountItem(label=r[0], count=int(r[1])) for r in by_dept_rows],
        monthly_trend=[MonthlyTrendItem(month=str(r[0]), count=int(r[1])) for r in monthly_rows],
    )

