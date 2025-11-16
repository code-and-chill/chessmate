"""Privacy settings response DTO."""
from pydantic import BaseModel

from app.domain.models.privacy_level import PrivacyLevel


class PrivacySettingsResponse(BaseModel):
    """Privacy settings response model."""

    show_ratings: bool
    show_online_status: bool
    show_game_archive: bool
    allow_friend_requests: PrivacyLevel
    allow_messages_from: PrivacyLevel
    allow_challenges_from: PrivacyLevel
    is_profile_public: bool

    class Config:
        from_attributes = True
