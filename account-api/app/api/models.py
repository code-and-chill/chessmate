from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl
from app.domain.models.privacy_level import PrivacyLevel
from app.domain.models.title_code import TitleCode


# Request models for account creation and updates


class CreateAccountRequest(BaseModel):
    """Create account request."""

    auth_user_id: UUID
    username: str = Field(..., min_length=3, max_length=32)
    display_name: str = Field(..., min_length=1, max_length=64)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    language_code: Optional[str] = Field(None, min_length=2, max_length=8)
    time_zone: Optional[str] = None


class UpdateAccountRequest(BaseModel):
    """Update account request."""

    display_name: Optional[str] = Field(None, min_length=1, max_length=64)
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    language_code: Optional[str] = Field(None, min_length=2, max_length=8)
    time_zone: Optional[str] = None


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


class UpdatePreferencesRequest(BaseModel):
    """Update preferences request."""

    board_theme: Optional[str] = None
    piece_set: Optional[str] = None
    sound_enabled: Optional[bool] = None
    animation_level: Optional[AnimationLevel] = None
    highlight_legal_moves: Optional[bool] = None
    show_coordinates: Optional[bool] = None
    confirm_moves: Optional[bool] = None
    default_time_control: Optional[DefaultTimeControl] = None
    auto_queen_promotion: Optional[bool] = None


class UpdatePrivacySettingsRequest(BaseModel):
    """Update privacy settings request."""

    show_ratings: Optional[bool] = None
    show_online_status: Optional[bool] = None
    show_game_archive: Optional[bool] = None
    allow_friend_requests: Optional[PrivacyLevel] = None
    allow_messages_from: Optional[PrivacyLevel] = None
    allow_challenges_from: Optional[PrivacyLevel] = None
    is_profile_public: Optional[bool] = None


# Response models


class AccountResponse(BaseModel):
    """Account response model."""

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

    model_config = ConfigDict(from_attributes=True)


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


class MediaResponse(BaseModel):
    """Media response model."""

    model_config = ConfigDict(from_attributes=True)

    avatar_file_id: Optional[UUID] = None
    banner_file_id: Optional[UUID] = None
    avatar_version: int


class PreferencesResponse(BaseModel):
    """Preferences response model."""

    model_config = ConfigDict(from_attributes=True)

    board_theme: str
    piece_set: str
    sound_enabled: bool
    animation_level: AnimationLevel
    highlight_legal_moves: bool
    show_coordinates: bool
    confirm_moves: bool
    default_time_control: DefaultTimeControl
    auto_queen_promotion: bool


class PrivacySettingsResponse(BaseModel):
    """Privacy settings response model."""

    model_config = ConfigDict(from_attributes=True)

    show_ratings: bool
    show_online_status: bool
    show_game_archive: bool
    allow_friend_requests: PrivacyLevel
    allow_messages_from: PrivacyLevel
    allow_challenges_from: PrivacyLevel
    is_profile_public: bool


class SocialCountersResponse(BaseModel):
    """Social counters response model."""

    model_config = ConfigDict(from_attributes=True)

    followers_count: int
    following_count: int
    friends_count: int
    clubs_count: int
    total_games_played: int
    total_puzzles_solved: int
    last_game_at: Optional[datetime] = None
    last_puzzle_at: Optional[datetime] = None


class FullAccountResponse(BaseModel):
    """Full account response (self view)."""

    account: AccountResponse
    profile_details: ProfileDetailsResponse
    media: MediaResponse
    preferences: PreferencesResponse
    privacy_settings: PrivacySettingsResponse
    social_counters: SocialCountersResponse


class PublicAccountResponse(BaseModel):
    """Public account response (limited by privacy settings)."""

    account: AccountResponse
    profile_details: ProfileDetailsResponse
    media: MediaResponse
    social_counters: SocialCountersResponse
