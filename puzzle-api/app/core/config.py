"""Configuration for puzzle-api."""

import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    SERVICE_NAME: str = "puzzle-api"
    PROJECT_NAME: str = "Puzzle API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "Chess puzzle service"
    
    DEBUG: bool = True
    PORT: int = 8007
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./puzzles.db")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_DECODE_RESPONSES: bool = True
    CACHE_ENABLED: bool = True
    DAILY_PUZZLE_CACHE_TTL_SECONDS: int = 86400  # 24 hours
    PUZZLE_FEED_CACHE_TTL_SECONDS: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
