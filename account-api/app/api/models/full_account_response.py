"""Full account response DTO."""
from pydantic import BaseModel

from app.api.models.account_response import AccountResponse
from app.api.models.media_response import MediaResponse
from app.api.models.preferences_response import PreferencesResponse
from app.api.models.privacy_settings_response import PrivacySettingsResponse
from app.api.models.profile_details_response import ProfileDetailsResponse
from app.api.models.social_counters_response import SocialCountersResponse


class FullAccountResponse(BaseModel):
    """Full account response (self view)."""

    account: AccountResponse
    profile_details: ProfileDetailsResponse
    media: MediaResponse
    preferences: PreferencesResponse
    privacy_settings: PrivacySettingsResponse
    social_counters: SocialCountersResponse
