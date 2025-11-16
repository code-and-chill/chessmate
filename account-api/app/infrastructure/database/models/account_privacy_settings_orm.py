"""Account privacy settings ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


def utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


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
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
