from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


class AccountORM(Base):
    """Account ORM model."""

    __tablename__ = "accounts"

    id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    auth_user_id = Column(PGUUID(as_uuid=True), nullable=False, unique=True, index=True)
    username = Column(String(32), nullable=False, unique=True, index=True)
    display_name = Column(String(64), nullable=False)
    title_code = Column(String(8), nullable=True)
    country_code = Column(String(2), nullable=True)
    time_zone = Column(String(64), nullable=True)
    language_code = Column(String(8), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    is_banned = Column(Boolean, nullable=False, default=False)
    is_kid_account = Column(Boolean, nullable=False, default=False)
    is_titled_player = Column(Boolean, nullable=False, default=False)
    member_since = Column(DateTime(timezone=True), nullable=False)
    last_seen_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("username", name="uq_username"),)


class AccountProfileDetailsORM(Base):
    """Account profile details ORM model."""

    __tablename__ = "account_profile_details"

    account_id = Column(
        PGUUID(as_uuid=True),
        primary_key=True,
        nullable=False,
    )
    bio = Column(Text, nullable=True)
    location_text = Column(String(128), nullable=True)
    website_url = Column(String(255), nullable=True)
    youtube_url = Column(String(255), nullable=True)
    twitch_url = Column(String(255), nullable=True)
    twitter_url = Column(String(255), nullable=True)
    other_link_url = Column(String(255), nullable=True)
    favorite_players = Column(Text, nullable=True)
    favorite_openings = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class AccountMediaORM(Base):
    """Account media ORM model."""

    __tablename__ = "account_media"

    account_id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    avatar_file_id = Column(PGUUID(as_uuid=True), nullable=True)
    banner_file_id = Column(PGUUID(as_uuid=True), nullable=True)
    avatar_version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class AccountPreferencesORM(Base):
    """Account preferences ORM model."""

    __tablename__ = "account_preferences"

    account_id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    board_theme = Column(String(32), nullable=False, default="classic")
    piece_set = Column(String(32), nullable=False, default="classic")
    sound_enabled = Column(Boolean, nullable=False, default=True)
    animation_level = Column(String(16), nullable=False, default="full")
    highlight_legal_moves = Column(Boolean, nullable=False, default=True)
    show_coordinates = Column(Boolean, nullable=False, default=True)
    confirm_moves = Column(Boolean, nullable=False, default=False)
    default_time_control = Column(String(16), nullable=False, default="blitz")
    auto_queen_promotion = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class AccountPrivacySettingsORM(Base):
    """Account privacy settings ORM model."""

    __tablename__ = "account_privacy_settings"

    account_id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    show_ratings = Column(Boolean, nullable=False, default=True)
    show_online_status = Column(Boolean, nullable=False, default=True)
    show_game_archive = Column(Boolean, nullable=False, default=True)
    allow_friend_requests = Column(String(16), nullable=False, default="everyone")
    allow_messages_from = Column(String(16), nullable=False, default="everyone")
    allow_challenges_from = Column(String(16), nullable=False, default="everyone")
    is_profile_public = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class AccountSocialCountersORM(Base):
    """Account social counters ORM model."""

    __tablename__ = "account_social_counters"

    account_id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    followers_count = Column(Integer, nullable=False, default=0)
    following_count = Column(Integer, nullable=False, default=0)
    friends_count = Column(Integer, nullable=False, default=0)
    clubs_count = Column(Integer, nullable=False, default=0)
    total_games_played = Column(Integer, nullable=False, default=0)
    total_puzzles_solved = Column(Integer, nullable=False, default=0)
    last_game_at = Column(DateTime(timezone=True), nullable=True)
    last_puzzle_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
