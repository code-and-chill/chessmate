from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    SERVICE_NAME: str = "bot-orchestrator-api"
    PROJECT_NAME: str = "Bot Orchestrator API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "Orchestrates engine-backed chess bots using BotSpec, engine cluster, and chess knowledge services."
    )

    DEBUG: bool = True
    PORT: int = 8005
    API_V1_STR: str = "/v1"

    ALLOWED_HOSTS: List[str] = ["*"]

    # Dependencies
    ENGINE_CLUSTER_URL: Optional[str] = None
    BOT_CONFIG_URL: Optional[str] = None
    CHESS_KNOWLEDGE_URL: Optional[str] = None

    # Timeouts
    HTTP_CLIENT_TIMEOUT_MS: int = 1000
    ENGINE_QUERY_TIMEOUT_SECONDS: float = 20.0  # Engine query: 20s max
    KNOWLEDGE_QUERY_TIMEOUT_SECONDS: float = 5.0  # Knowledge query: 5s max
    TOTAL_BOT_MOVE_TIMEOUT_SECONDS: float = 30.0  # Total bot move: 30s max

    # OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: Optional[str] = None  # e.g., "http://localhost:4317"
    OTEL_SERVICE_NAME: str = "bot-orchestrator-api"
    OTEL_TRACES_EXPORTER: str = "otlp"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
