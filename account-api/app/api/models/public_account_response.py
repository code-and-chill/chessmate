"""Public account response DTO."""
from pydantic import BaseModel

from app.api.models.account_response import AccountResponse
from app.api.models.media_response import MediaResponse
from app.api.models.profile_details_response import ProfileDetailsResponse
from app.api.models.social_counters_response import SocialCountersResponse


class PublicAccountResponse(BaseModel):
    """Public account response (limited by privacy settings)."""

    account: AccountResponse
    profile_details: ProfileDetailsResponse
    media: MediaResponse
    social_counters: SocialCountersResponse
