"""Account response DTO."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.models.title_code import TitleCode


class AccountResponse(BaseModel):
    """Account response model."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    display_name: str
    title_code: Optional[TitleCode] = None
    country_code: Optional[str] = None
    time_zone: Optional[str] = None
    language_code: Optional[str] = None
    is_active: bool
    is_banned: bool
    is_kid_account: bool
    is_titled_player: bool
    member_since: datetime
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
