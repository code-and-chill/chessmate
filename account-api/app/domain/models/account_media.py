"""Account media domain model."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AccountMedia(BaseModel):
    """Account media domain model."""

    account_id: UUID
    avatar_file_id: Optional[UUID] = None
    banner_file_id: Optional[UUID] = None
    avatar_version: int = 1
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
