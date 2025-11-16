"""Account profile details ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


def utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


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
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
