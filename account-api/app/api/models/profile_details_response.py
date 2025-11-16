"""Profile details response DTO."""
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfileDetailsResponse(BaseModel):
    """Profile details response model."""

    model_config = ConfigDict(from_attributes=True)

    bio: Optional[str] = None
    location_text: Optional[str] = None
    website_url: Optional[str] = None
    youtube_url: Optional[str] = None
    twitch_url: Optional[str] = None
    twitter_url: Optional[str] = None
    other_link_url: Optional[str] = None
    favorite_players: Optional[str] = None
    favorite_openings: Optional[str] = None
