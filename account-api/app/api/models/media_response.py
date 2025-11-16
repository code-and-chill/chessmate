"""Media response DTO."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MediaResponse(BaseModel):
    """Media response model."""

    model_config = ConfigDict(from_attributes=True)

    avatar_file_id: Optional[UUID] = None
    banner_file_id: Optional[UUID] = None
    avatar_version: int
