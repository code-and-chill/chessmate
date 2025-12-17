"""Application configuration management."""

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Application
    PROJECT_NAME: str = "Live Game API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Real-time chess service for live, clock-based games"
    DEBUG: bool = False
    PORT: int = 8000

    # API
    API_V1_STR: str = "/api/v1"
    ALLOWED_HOSTS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/live_game"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Authentication
    AUTH_API_URL: str = "http://localhost:8001"
    JWT_SECRET_KEY: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"

    # Chess Engine
    MOVE_VALIDATION_TIMEOUT_MS: int = 5000

    # Bot Orchestrator
    BOT_ORCHESTRATOR_API_URL: str = "http://localhost:8006"

    # Kafka Event Publishing
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_GAME_EVENTS_TOPIC: str = "game-events"
    KAFKA_ENABLED: bool = True
    KAFKA_PRODUCER_RETRIES: int = 3
    KAFKA_PRODUCER_ACKS: str = "all"  # Wait for all replicas to acknowledge
    KAFKA_PRODUCER_MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION: int = 1  # Ensure ordering

    # Redis (for sharding and caching)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_DECODE_RESPONSES: bool = True

    # Sharding Configuration
    SHARD_ENABLED: bool = False  # Enable sharding when ready
    SHARD_COUNT: int = 8  # Number of shards
    GAME_CACHE_TTL_SECONDS: int = 3600  # 1 hour TTL for active games in Redis
    SNAPSHOT_INTERVAL_MOVES: int = 10  # Snapshot every N moves
    SNAPSHOT_INTERVAL_SECONDS: int = 300  # Or every 5 minutes

    # WebSocket Configuration
    WEBSOCKET_HEARTBEAT_INTERVAL_SECONDS: int = 30  # Ping interval
    WEBSOCKET_RESUME_TOKEN_TTL_SECONDS: int = 3600  # 1 hour TTL for resume tokens

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_MOVE_SUBMISSION_LIMIT: int = 10  # Max 10 moves per user per window
    RATE_LIMIT_MOVE_SUBMISSION_WINDOW_SECONDS: int = 60  # 60 second window
    RATE_LIMIT_IP_LIMIT: int = 50  # Max 50 requests per IP per window
    RATE_LIMIT_IP_WINDOW_SECONDS: int = 60  # 60 second window

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"

    # OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: Optional[str] = None  # e.g., "http://localhost:4317"
    OTEL_SERVICE_NAME: str = "live-game-api"
    OTEL_TRACES_EXPORTER: str = "otlp"

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
