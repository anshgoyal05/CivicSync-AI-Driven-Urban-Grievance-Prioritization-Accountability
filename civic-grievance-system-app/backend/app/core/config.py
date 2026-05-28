from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "civic-grievance-system"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Security
    secret_key: str
    access_token_expire_minutes: int = 60 * 24
    password_bcrypt_rounds: int = 12

    # CORS
    cors_allow_origins: str = "http://localhost:3000"

    # Database
    database_url: str

    # Storage
    upload_dir: str = "app/storage/uploads"
    max_upload_mb: int = 8

    # AI
    text_model_path: str = "app/ai/models/text_priority.joblib"
    text_vectorizer_path: str = "app/ai/models/text_vectorizer.joblib"
    text_training_data_path: str = "app/ai/sample_grievances.csv"

    clip_model_name: str = "openai/clip-vit-base-patch32"

    # Rate limiting
    rate_limit_per_minute: int = 60

    # OAuth (optional — set to enable Google sign-in)
    google_client_id: str | None = None


settings = Settings()
