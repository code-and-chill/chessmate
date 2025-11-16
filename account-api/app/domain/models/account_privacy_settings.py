"""Account privacy settings domain model."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.models.privacy_level import PrivacyLevel


class AccountPrivacySettings(BaseModel):
    """Account privacy settings domain model."""
    model_config = ConfigDict(from_attributes=True)

    account_id: UUID
    show_ratings: bool = True
    show_online_status: bool = True
    show_game_archive: bool = True
    allow_friend_requests: PrivacyLevel = PrivacyLevel.EVERYONE
    allow_messages_from: PrivacyLevel = PrivacyLevel.EVERYONE
    allow_challenges_from: PrivacyLevel = PrivacyLevel.EVERYONE
    is_profile_public: bool = True
    created_at: datetime
    updated_at: datetime
