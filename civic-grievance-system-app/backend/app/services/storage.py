from __future__ import annotations

import os
import secrets
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def _safe_ext(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return ext


def validate_upload_image(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing filename")
    ext = _safe_ext(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported image type")
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported content type")


def save_upload(file: UploadFile) -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = _safe_ext(file.filename or "image.jpg")
    token = secrets.token_urlsafe(16)
    filename = f"{token}{ext}"
    dest_path = os.path.join(settings.upload_dir, filename)

    size = 0
    max_bytes = settings.max_upload_mb * 1024 * 1024
    with open(dest_path, "wb") as out:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                out.close()
                try:
                    os.remove(dest_path)
                except OSError:
                    pass
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Image exceeds {settings.max_upload_mb}MB",
                )
            out.write(chunk)

    return f"/uploads/{filename}"
