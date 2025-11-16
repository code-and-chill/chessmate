from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""

    # Application
    PROJECT_NAME: str = "Account API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "Player account and profile management service"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    PORT: int = Field(default=8000, ge=1, le=65535)

    # API
    API_V1_STR: str = "/v1"
    INTERNAL_API_STR: str = "/internal"
    ALLOWED_HOSTS: List[str] = Field(default=["*"])

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/account_db"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, ge=1, le=100)
    DATABASE_MAX_OVERFLOW: int = Field(default=20, ge=0, le=100)

    # JWT
    JWT_SECRET_KEY: str = Field(default="your-secret-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = Field(default=24, ge=1, le=168)

    # Service Configuration
    AUTH_API_URL: Optional[str] = None
    SERVICE_NAME: str = "account-api"

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret_key(cls, v: str, info) -> str:
        """Validate JWT secret key for production use."""
        if info.data.get("ENVIRONMENT") == "production":
            if v == "your-secret-key-change-in-prod" or len(v) < 32:
                raise ValueError(
                    "JWT_SECRET_KEY must be changed and at least 32 characters in production"
                )
        return v

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_allowed_hosts(cls, v) -> List[str]:
        """Parse ALLOWED_HOSTS from string or list."""
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level."""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in valid_levels:
            raise ValueError(f"LOG_LEVEL must be one of {valid_levels}")
        return v_upper


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
