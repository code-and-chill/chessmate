from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SERVICE_NAME: str = "rating-api"
    PROJECT_NAME: str = "Rating API"
    DESCRIPTION: str = "Player rating service using Glicko-2"
    VERSION: str = "0.1.0"

    PORT: int = 8013
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "postgresql+asyncpg://chessmate_user:chessmate_pass@localhost:5432/chessmate_db"
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    # Auth
    REQUIRE_AUTH: bool = False  # enable in non-dev
    INTERNAL_BEARER_TOKEN: str | None = None

    # Glicko-2 defaults
    GLICKO_DEFAULT_RATING: float = 1500.0
    GLICKO_DEFAULT_RD: float = 350.0
    GLICKO_DEFAULT_VOLATILITY: float = 0.06
    GLICKO_TAU: float = 0.5

    # Outbox
    OUTBOX_ENABLED: bool = True
    OUTBOX_NATS_URL: str | None = None
    OUTBOX_PUBLISH_INTERVAL_SEC: float = 0.5

    # Kafka Event Consumption
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_GAME_EVENTS_TOPIC: str = "game-events"
    KAFKA_CONSUMER_GROUP_ID: str = "rating-api-consumer"
    KAFKA_CONSUMER_ENABLED: bool = True
    KAFKA_CONSUMER_AUTO_COMMIT: bool = True

    ALLOWED_HOSTS: list[str] = ["*"]

    # OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: str | None = None  # e.g., "http://localhost:4317"
    OTEL_SERVICE_NAME: str = "rating-api"
    OTEL_TRACES_EXPORTER: str = "otlp"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
