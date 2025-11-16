from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    SERVICE_NAME: str = "engine-cluster-api"
    PROJECT_NAME: str = "Engine Cluster API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "Chess engine cluster providing position evaluation and candidate move analysis."

    DEBUG: bool = True
    PORT: int = 9000
    API_V1_STR: str = "/v1"

    ALLOWED_HOSTS: List[str] = ["*"]

    # Engine configuration
    STOCKFISH_PATH: Optional[str] = None  # Path to stockfish binary
    ENGINE_THREADS: int = 1
    ENGINE_HASH_MB: int = 128

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
