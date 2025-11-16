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

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
