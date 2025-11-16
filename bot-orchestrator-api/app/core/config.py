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

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
