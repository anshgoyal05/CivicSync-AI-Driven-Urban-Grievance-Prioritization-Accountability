from __future__ import annotations


CATEGORY_TO_DEPARTMENT: dict[str, str] = {
    "Roads": "Public Works Department",
    "Pothole": "Public Works Department",
    "Streetlight": "Electricity Department",
    "Garbage": "Sanitation Department",
    "Sewage": "Water & Sewerage Department",
    "Water Supply": "Water Department",
    "Drainage": "Stormwater Drainage Department",
    "Traffic": "Traffic Police",
    "Encroachment": "Municipal Enforcement",
    "Parks": "Parks & Horticulture",
    "Noise": "Pollution Control",
    "Air Pollution": "Pollution Control",
    "Public Safety": "Public Safety Department",
}


def assign_department(category: str) -> str:
    category_clean = (category or "").strip()
    if category_clean in CATEGORY_TO_DEPARTMENT:
        return CATEGORY_TO_DEPARTMENT[category_clean]
    return "Municipal Corporation"

