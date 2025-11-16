"""Create account request DTO."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CreateAccountRequest(BaseModel):
    """Create account request."""

    auth_user_id: UUID
    username: str = Field(..., min_length=3, max_length=32)
    display_name: str = Field(..., min_length=1, max_length=64)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    language_code: Optional[str] = Field(None, min_length=2, max_length=8)
    time_zone: Optional[str] = None
