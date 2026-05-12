from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from PIL import Image
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.grievance import Grievance
from app.models.user import User
from app.schemas.grievance import GrievanceResponse
from app.services.departments import assign_department
from app.services.storage import save_upload, validate_upload_image

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


@router.post("", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
async def create_grievance(
    request: Request,
    title: str = Form(..., min_length=3, max_length=200),
    description: str = Form(..., min_length=10, max_length=5000),
    category: str = Form(..., min_length=2, max_length=80),
    region_state: str = Form(..., min_length=2, max_length=80),
    region_city: str = Form(..., min_length=2, max_length=80),
    region_sector: str = Form(..., min_length=1, max_length=120),
    latitude: str = Form(default=""),
    longitude: str = Form(default=""),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_url: str | None = None
    pil_image: Image.Image | None = None

    if image is not None:
        validate_upload_image(image)
        try:
            pil_image = Image.open(image.file)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file") from e
        image.file.seek(0)
        image_url = save_upload(image)

    predictor = request.app.state.ai_predictor
    prediction = predictor.predict(
        title=title.strip(),
        description=description.strip(),
        image=pil_image,
    )

    lat_val: float | None = None
    lon_val: float | None = None
    if latitude and latitude.strip():
        try:
            lat_val = float(latitude.strip())
        except ValueError:
            pass
    if longitude and longitude.strip():
        try:
            lon_val = float(longitude.strip())
        except ValueError:
            pass

    department = assign_department(category)
    grievance = Grievance(
        user_id=current_user.id,
        title=title.strip(),
        description=description.strip(),
        category=category.strip(),
        region_state=region_state.strip(),
        region_city=region_city.strip(),
        region_sector=region_sector.strip(),
        latitude=lat_val,
        longitude=lon_val,
        image_path=image_url,
        predicted_priority=prediction.priority,
        confidence_score=prediction.confidence,
        ai_explanation=prediction.explanation,
        department=department,
        status="Pending",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)
    return _to_response(grievance)


@router.get("/my", response_model=list[GrievanceResponse])
def list_my_grievances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grievances = (
        db.query(Grievance)
        .filter(Grievance.user_id == current_user.id)
        .order_by(Grievance.created_at.desc())
        .all()
    )
    return [_to_response(g) for g in grievances]


@router.get("/{grievance_id}", response_model=GrievanceResponse)
def get_grievance(
    grievance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grievance not found")
    if grievance.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return _to_response(grievance)

