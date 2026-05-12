from __future__ import annotations

import re
from dataclasses import dataclass

from PIL import Image

from app.ai.image_severity import ClipImageSeverity, ImageSeverityResult
from app.ai.text_priority import TextModelBundle, predict_text_priority


@dataclass(frozen=True)
class PriorityPrediction:
    priority: str
    confidence: float
    explanation: str
    breakdown: dict[str, float]


PRIORITIES = ["Low", "Medium", "High", "Critical"]
PRIORITY_TO_SCORE = {"Low": 0.25, "Medium": 0.5, "High": 0.75, "Critical": 1.0}


KEYWORD_RULES: list[tuple[str, float, str]] = [
    (r"\b(accident|crash|collision)\b", 0.20, "Keyword indicates accident risk"),
    (r"\b(fire|blast|explosion)\b", 0.35, "Keyword indicates fire/explosion"),
    (r"\b(flood|waterlogging|inundation)\b", 0.25, "Keyword indicates flooding"),
    (r"\b(electrocution|live wire|short circuit)\b", 0.35, "Keyword indicates electrical hazard"),
    (r"\b(sewage|overflow|manhole)\b", 0.20, "Keyword indicates sewage hazard"),
    (r"\b(collapse|sinkhole)\b", 0.30, "Keyword indicates structural danger"),
]


def _apply_keyword_boost(text: str) -> tuple[float, list[str]]:
    boosts: list[str] = []
    boost_score = 0.0
    for pattern, boost, reason in KEYWORD_RULES:
        if re.search(pattern, text, flags=re.IGNORECASE):
            boost_score = max(boost_score, boost)
            boosts.append(reason)
    return boost_score, boosts


def _score_to_priority(score: float) -> str:
    if score >= 0.85:
        return "Critical"
    if score >= 0.65:
        return "High"
    if score >= 0.45:
        return "Medium"
    return "Low"


def predict_priority(
    *,
    text_bundle: TextModelBundle,
    image_model: ClipImageSeverity,
    title: str,
    description: str,
    image: Image.Image | None,
) -> PriorityPrediction:
    text_label, text_conf, text_probs = predict_text_priority(text_bundle, title=title, description=description)
    text_score = PRIORITY_TO_SCORE.get(text_label, 0.5)

    keyword_boost, keyword_reasons = _apply_keyword_boost(f"{title} {description}")

    image_result: ImageSeverityResult | None = None
    image_score = 0.0
    if image is not None:
        image_result = image_model.predict(image)
        image_score = float(image_result.score)

    combined = 0.70 * text_score + 0.30 * image_score
    combined = min(1.0, combined + keyword_boost)

    final_priority = _score_to_priority(combined)
    confidence = float(max(0.25, min(0.99, (0.55 * text_conf) + (0.45 * (image_result.confidence if image_result else 0.0)))))

    parts: list[str] = [
        f"Text model predicted **{text_label}** (p={text_conf:.2f}).",
    ]
    if image_result:
        parts.append(f"Image model suggested **{image_result.label}** ({image_result.explanation}).")
    if keyword_reasons:
        parts.append("Keyword signals: " + "; ".join(keyword_reasons) + ".")
    parts.append(f"Final combined priority: **{final_priority}**.")

    breakdown = {
        "text_score": float(text_score),
        "image_score": float(image_score),
        "keyword_boost": float(keyword_boost),
        "combined_score": float(combined),
    }
    return PriorityPrediction(priority=final_priority, confidence=confidence, explanation=" ".join(parts), breakdown=breakdown)

