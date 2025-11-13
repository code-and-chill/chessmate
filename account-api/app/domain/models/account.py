from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TitleCode(str, Enum):
    """Chess titles."""

    GM = "GM"  # Grandmaster
    IM = "IM"  # International Master
    FM = "FM"  # FIDE Master
    NM = "NM"  # National Master
    WGM = "WGM"  # Woman Grandmaster
    WIM = "WIM"  # Woman International Master
    WFM = "WFM"  # Woman FIDE Master
    WNM = "WNM"  # Woman National Master


class Account(BaseModel):
    """Account domain model."""

    id: UUID
    auth_user_id: UUID
    username: str = Field(..., min_length=3, max_length=32)
    display_name: str = Field(..., min_length=1, max_length=64)
    title_code: Optional[TitleCode] = None
    country_code: Optional[str] = Field(None, min_length=2, max_length=2)
    time_zone: Optional[str] = None
    language_code: Optional[str] = Field(None, min_length=2, max_length=8)
    is_active: bool = True
    is_banned: bool = False
    is_kid_account: bool = False
    is_titled_player: bool = False
    member_since: datetime
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AccountProfileDetails(BaseModel):
    """Account profile details domain model."""

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

    class Config:
        from_attributes = True


class AccountMedia(BaseModel):
    """Account media domain model."""

    account_id: UUID
    avatar_file_id: Optional[UUID] = None
    banner_file_id: Optional[UUID] = None
    avatar_version: int = 1
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnimationLevel(str, Enum):
    """Animation levels."""

    NONE = "none"
    MINIMAL = "minimal"
    FULL = "full"


class DefaultTimeControl(str, Enum):
    """Default time control."""

    BULLET = "bullet"
    BLITZ = "blitz"
    RAPID = "rapid"
    CLASSICAL = "classical"


class AccountPreferences(BaseModel):
    """Account preferences domain model."""

    account_id: UUID
    board_theme: str = "classic"
    piece_set: str = "classic"
    sound_enabled: bool = True
    animation_level: AnimationLevel = AnimationLevel.FULL
    highlight_legal_moves: bool = True
    show_coordinates: bool = True
    confirm_moves: bool = False
    default_time_control: DefaultTimeControl = DefaultTimeControl.BLITZ
    auto_queen_promotion: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PrivacyLevel(str, Enum):
    """Privacy level for settings."""

    EVERYONE = "everyone"
    FRIENDS_OF_FRIENDS = "friends_of_friends"
    FRIENDS = "friends"
    NO_ONE = "no_one"


class AccountPrivacySettings(BaseModel):
    """Account privacy settings domain model."""

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

    class Config:
        from_attributes = True


class AccountSocialCounters(BaseModel):
    """Account social counters domain model (denormalized)."""

    account_id: UUID
    followers_count: int = 0
    following_count: int = 0
    friends_count: int = 0
    clubs_count: int = 0
    total_games_played: int = 0
    total_puzzles_solved: int = 0
    last_game_at: Optional[datetime] = None
    last_puzzle_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True
