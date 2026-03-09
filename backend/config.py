from pydantic_settings import BaseSettings
from typing import Literal


OPENAI_MODELS = {"gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"}
ANTHROPIC_MODELS = {
    "claude-opus-4-6",
    "claude-sonnet-4-6",
    "claude-haiku-4-5-20251001",
}
ALL_MODELS = OPENAI_MODELS | ANTHROPIC_MODELS


class Settings(BaseSettings):
    host: str = "127.0.0.1"
    port: int = 8080
    cors_origins: list[str] = ["http://localhost:3000"]

    database_url: str = "sqlite+aiosqlite:///./data/ai_factory.db"
    checkpoint_db_path: str = "./data/checkpoints.db"

    default_provider: str = "anthropic"
    default_model: str = "claude-haiku-4-5-20251001"
    default_temperature: float = 0.7
    default_max_tokens: int = 4096

    openai_api_key: str = ""
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
