from __future__ import annotations

from dataclasses import dataclass

from PIL import Image

from app.ai.image_severity import ClipImageSeverity
from app.ai.pipeline import PriorityPrediction, predict_priority
from app.ai.text_priority import TextModelBundle, ensure_text_model
from app.core.config import settings


@dataclass
class AIPredictor:
    text_bundle: TextModelBundle
    image_model: ClipImageSeverity

    @classmethod
    def load(cls) -> "AIPredictor":
        text_bundle = ensure_text_model(
            training_csv_path=settings.text_training_data_path,
            model_path=settings.text_model_path,
            vectorizer_path=settings.text_vectorizer_path,
        )
        image_model = ClipImageSeverity(settings.clip_model_name)
        return cls(text_bundle=text_bundle, image_model=image_model)

    def predict(self, *, title: str, description: str, image: Image.Image | None) -> PriorityPrediction:
        return predict_priority(
            text_bundle=self.text_bundle,
            image_model=self.image_model,
            title=title,
            description=description,
            image=image,
        )

