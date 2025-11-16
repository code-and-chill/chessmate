"""Account media domain model."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AccountMedia(BaseModel):
    """Account media domain model."""
    model_config = ConfigDict(from_attributes=True)

    account_id: UUID
    avatar_file_id: Optional[UUID] = None
    banner_file_id: Optional[UUID] = None
    avatar_version: int = 1
    created_at: datetime
    updated_at: datetime
