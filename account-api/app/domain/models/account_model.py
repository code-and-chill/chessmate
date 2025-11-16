"""Account domain model."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.domain.models.title_code import TitleCode


class Account(BaseModel):
    """Account domain model."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    auth_user_id: UUID
    username: str = Field(..., min_length=3, max_length=32)
    display_name: str = Field(..., min_length=1, max_length=64)
    title_code: Optional[TitleCode] = None
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    time_zone: Optional[str] = None
    language_code: Optional[str] = Field(None, min_length=2, max_length=8)
    is_active: bool = True
    is_banned: bool = False
    is_kid_account: bool = False
    is_titled_player: bool = False
    member_since: datetime
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
