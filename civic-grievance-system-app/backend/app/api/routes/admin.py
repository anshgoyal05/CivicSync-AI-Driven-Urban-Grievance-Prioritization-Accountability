from __future__ import annotations

import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.grievance import Grievance
from app.models.user import User
from app.schemas.grievance import GrievanceResponse, StatusUpdateRequest

router = APIRouter()


def _to_response(g: Grievance) -> GrievanceResponse:
    return GrievanceResponse(
        id=g.id,
        user_id=g.user_id,
        title=g.title,
        description=g.description,
        category=g.category,
        region_state=g.region_state,
        region_city=g.region_city,
        region_sector=g.region_sector,
        latitude=g.latitude,
        longitude=g.longitude,
        image_path=g.image_path,
        predicted_priority=g.predicted_priority,
        confidence_score=g.confidence_score,
        ai_explanation=g.ai_explanation,
        department=g.department,
        status=g.status,
        created_at=g.created_at,
        updated_at=g.updated_at,
    )


@router.get("/grievances", response_model=list[GrievanceResponse])
def list_grievances(
    state: str | None = None,
    city: str | None = None,
    sector: str | None = None,
    priority: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    department: str | None = None,
    search: str | None = None,
    date_from: str | None = None,  # ISO date
    date_to: str | None = None,  # ISO date
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Grievance)
    filters = []
    if state:
        filters.append(Grievance.region_state == state)
    if city:
        filters.append(Grievance.region_city == city)
    if sector:
        filters.append(Grievance.region_sector == sector)
    if priority:
        filters.append(Grievance.predicted_priority == priority)
    if status_filter:
        filters.append(Grievance.status == status_filter)
    if department:
        filters.append(Grievance.department == department)
    if search:
        like = f"%{search}%"
        filters.append((Grievance.title.ilike(like)) | (Grievance.description.ilike(like)))
    if date_from:
        try:
            dt = datetime.fromisoformat(date_from).date()
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date_from") from e
        filters.append(Grievance.created_at >= datetime(dt.year, dt.month, dt.day))
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to).date()
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date_to") from e
        filters.append(Grievance.created_at < datetime(dt.year, dt.month, dt.day, 23, 59, 59))

    if filters:
        q = q.filter(and_(*filters))

    grievances = q.order_by(Grievance.created_at.desc()).limit(2000).all()
    return [_to_response(g) for g in grievances]


@router.patch("/grievances/{grievance_id}/status", response_model=GrievanceResponse)
def update_status(
    grievance_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grievance not found")

    old = grievance.status
    new = payload.new_status
    if old == new:
        return _to_response(grievance)

    grievance.status = new
    audit = AuditLog(grievance_id=grievance.id, old_status=old, new_status=new, changed_by=admin_user.id)
    db.add(audit)
    db.add(grievance)
    db.commit()
    db.refresh(grievance)
    return _to_response(grievance)


@router.get("/grievances/export")
def export_csv(
    state: str | None = None,
    city: str | None = None,
    sector: str | None = None,
    priority: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    department: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Grievance)
    if state:
        q = q.filter(Grievance.region_state == state)
    if city:
        q = q.filter(Grievance.region_city == city)
    if sector:
        q = q.filter(Grievance.region_sector == sector)
    if priority:
        q = q.filter(Grievance.predicted_priority == priority)
    if status_filter:
        q = q.filter(Grievance.status == status_filter)
    if department:
        q = q.filter(Grievance.department == department)
    if search:
        like = f"%{search}%"
        q = q.filter((Grievance.title.ilike(like)) | (Grievance.description.ilike(like)))

    grievances = q.order_by(Grievance.created_at.desc()).limit(10000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "user_id",
            "title",
            "category",
            "state",
            "city",
            "sector",
            "latitude",
            "longitude",
            "priority",
            "confidence",
            "department",
            "status",
            "created_at",
        ]
    )
    for g in grievances:
        writer.writerow(
            [
                g.id,
                g.user_id,
                g.title,
                g.category,
                g.region_state,
                g.region_city,
                g.region_sector,
                f"{g.latitude}" if g.latitude is not None else "",
                f"{g.longitude}" if g.longitude is not None else "",
                g.predicted_priority,
                f"{g.confidence_score:.3f}",
                g.department,
                g.status,
                g.created_at.isoformat() if g.created_at else "",
            ]
        )

    csv_bytes = output.getvalue().encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="grievances.csv"'},
    )

