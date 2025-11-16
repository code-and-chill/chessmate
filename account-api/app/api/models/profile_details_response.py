"""Profile details response DTO."""
from typing import Optional

from pydantic import BaseModel


class ProfileDetailsResponse(BaseModel):
    """Profile details response model."""

    bio: Optional[str] = None
    location_text: Optional[str] = None
    website_url: Optional[str] = None
    youtube_url: Optional[str] = None
    twitch_url: Optional[str] = None
    twitter_url: Optional[str] = None
    other_link_url: Optional[str] = None
    favorite_players: Optional[str] = None
    favorite_openings: Optional[str] = None

    class Config:
        from_attributes = True
