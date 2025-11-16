"""Update profile details request DTO."""
from typing import Optional

from pydantic import BaseModel, Field


class UpdateProfileDetailsRequest(BaseModel):
    """Update profile details request."""

    bio: Optional[str] = Field(None, max_length=500)
    location_text: Optional[str] = Field(None, max_length=128)
    website_url: Optional[str] = Field(None, max_length=255)
    youtube_url: Optional[str] = Field(None, max_length=255)
    twitch_url: Optional[str] = Field(None, max_length=255)
    twitter_url: Optional[str] = Field(None, max_length=255)
    other_link_url: Optional[str] = Field(None, max_length=255)
    favorite_players: Optional[str] = Field(None, max_length=500)
    favorite_openings: Optional[str] = Field(None, max_length=500)
