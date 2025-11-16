"""Media response DTO."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MediaResponse(BaseModel):
    """Media response model."""

    avatar_file_id: Optional[UUID] = None
    banner_file_id: Optional[UUID] = None
    avatar_version: int

    class Config:
        from_attributes = True
