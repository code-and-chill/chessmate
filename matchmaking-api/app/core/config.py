"""Configuration loader for matchmaking-api."""
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Service
    SERVICE_NAME: str = "matchmaking-api"
    PROJECT_NAME: str = "Matchmaking API"
    DESCRIPTION: str = "Matchmaking service for chess platform"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    PORT: int = 8003
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/matchmaking_db"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0
    DATABASE_POOL_TIMEOUT: int = 30

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_DECODE_RESPONSES: bool = True

    # JWT / Auth
    JWT_ALGORITHM: str = "HS256"
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_EXPIRATION_SECONDS: int = 3600

    # CORS
    ALLOWED_HOSTS: list[str] = ["*"]

    # Live Game API (internal service)
    LIVE_GAME_API_URL: str = "http://live-game-api:8002"
    LIVE_GAME_API_TIMEOUT_SECONDS: float = 5.0

    # Matchmaking Configuration
    MAX_QUEUE_TIME_SECONDS: int = 600  # 10 minutes
    INITIAL_RATING_WINDOW: int = 100  # ±100 rating points
    RATING_WINDOW_WIDENING_INTERVAL: int = 10  # Widen every 10 seconds
    RATING_WINDOW_WIDENING_AMOUNT: int = 25  # Widen by 25 points
    WORKER_INTERVAL_SECONDS: float = 1.0  # Match every 1 second
    WORKER_BATCH_SIZE: int = 100  # Process matches in batches
    MATCH_PAIRS_PER_BATCH: int = 50  # Number of pairs to attempt per batch

    # Observability
    LOG_LEVEL: str = "INFO"
    CORRELATION_ID_HEADER: str = "X-Correlation-ID"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
