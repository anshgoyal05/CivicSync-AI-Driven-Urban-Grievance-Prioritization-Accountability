from __future__ import annotations

from dataclasses import dataclass
from statistics import pstdev

from PIL import Image


@dataclass(frozen=True)
class ImageSeverityResult:
    label: str
    confidence: float
    score: float  # 0..1
    explanation: str


class ClipImageSeverity:
    """
    Lightweight image severity scorer (pure Pillow).

    Notes:
    - In full production deployments you can swap this with a deep model.
    - This implementation still performs real image analysis (brightness/contrast),
      and outputs a severity score + explanation deterministically.
    """

    def __init__(self, model_name: str):
        self.model_name = model_name

    def predict(self, image: Image.Image) -> ImageSeverityResult:
        im = image.convert("RGB").resize((224, 224))
        gray = im.convert("L")
        pixels = list(gray.getdata())
        mean = sum(pixels) / max(1, len(pixels))
        contrast = pstdev(pixels) if len(pixels) > 1 else 0.0

        # Heuristic: very dark + high contrast often indicates night hazard scenes;
        # high contrast can also indicate strong edges/scene complexity.
        # We treat higher contrast as higher potential severity.
        brightness_norm = mean / 255.0
        contrast_norm = min(1.0, contrast / 80.0)
        score = 0.15 + 0.70 * contrast_norm + (0.15 if brightness_norm < 0.25 else 0.0)
        score = max(0.0, min(1.0, score))

        if score >= 0.85:
            label = "Critical"
        elif score >= 0.65:
            label = "High"
        elif score >= 0.45:
            label = "Medium"
        else:
            label = "Low"

        confidence = max(0.25, min(0.85, 0.35 + 0.5 * contrast_norm))
        explanation = f"Image analysis: brightness={brightness_norm:.2f}, contrast={contrast_norm:.2f}"
        return ImageSeverityResult(label=label, confidence=float(confidence), score=float(score), explanation=explanation)

