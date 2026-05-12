from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

_REGIONS_PATH = Path(__file__).resolve().parents[2] / "data" / "regions.json"


@router.get("")
def list_regions():
    return json.loads(_REGIONS_PATH.read_text(encoding="utf-8"))

