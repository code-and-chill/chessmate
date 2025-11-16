"""Update privacy settings request DTO."""
from typing import Optional

from pydantic import BaseModel

from app.domain.models.privacy_level import PrivacyLevel


class UpdatePrivacySettingsRequest(BaseModel):
    """Update privacy settings request."""

    show_ratings: Optional[bool] = None
    show_online_status: Optional[bool] = None
    show_game_archive: Optional[bool] = None
    allow_friend_requests: Optional[PrivacyLevel] = None
    allow_messages_from: Optional[PrivacyLevel] = None
    allow_challenges_from: Optional[PrivacyLevel] = None
    is_profile_public: Optional[bool] = None
