"""Base entity domain model."""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


def get_now():
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


class BaseEntity(BaseModel):
    """Base entity with common fields."""

    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=get_now)
    updated_at: datetime = Field(default_factory=get_now)

    class Config:
        from_attributes = True
        use_enum_values = True
        validate_assignment = True
