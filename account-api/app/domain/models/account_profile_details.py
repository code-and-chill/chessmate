"""Account profile details domain model."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AccountProfileDetails(BaseModel):
    """Account profile details domain model."""
    model_config = ConfigDict(from_attributes=True)

    account_id: UUID
    bio: Optional[str] = Field(None, max_length=500)
    location_text: Optional[str] = Field(None, max_length=128)
    website_url: Optional[str] = Field(None, max_length=255)
    youtube_url: Optional[str] = Field(None, max_length=255)
    twitch_url: Optional[str] = Field(None, max_length=255)
    twitter_url: Optional[str] = Field(None, max_length=255)
    other_link_url: Optional[str] = Field(None, max_length=255)
    favorite_players: Optional[str] = Field(None, max_length=500)
    favorite_openings: Optional[str] = Field(None, max_length=500)
    created_at: datetime
    updated_at: datetime
