from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    SERVICE_NAME: str = "chess-knowledge-api"
    PROJECT_NAME: str = "Chess Knowledge API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "Chess knowledge service for opening books and endgame tablebases."

    DEBUG: bool = True
    PORT: int = 9002
    API_V1_STR: str = "/v1"

    ALLOWED_HOSTS: List[str] = ["*"]

    # Knowledge data paths
    OPENING_BOOK_PATH: Optional[str] = None
    TABLEBASE_PATH: Optional[str] = None

    # Redis caching
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_DECODE_RESPONSES: bool = True
    CACHE_ENABLED: bool = True
    OPENING_CACHE_TTL_SECONDS: int = 86400  # 24 hours
    TABLEBASE_CACHE_TTL_SECONDS: int = 86400  # 24 hours

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
