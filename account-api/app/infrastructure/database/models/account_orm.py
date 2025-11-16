"""Account ORM model."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import Boolean, Column, DateTime, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


def utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


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
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    __table_args__ = (UniqueConstraint("username", name="uq_username"),)
