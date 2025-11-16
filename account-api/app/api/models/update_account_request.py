"""Update account request DTO."""
from typing import Optional

from pydantic import BaseModel, Field


class UpdateAccountRequest(BaseModel):
    """Update account request."""

    display_name: Optional[str] = Field(None, min_length=1, max_length=64)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    language_code: Optional[str] = Field(None, min_length=2, max_length=8)
    time_zone: Optional[str] = None
