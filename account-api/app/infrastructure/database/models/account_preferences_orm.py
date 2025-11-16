"""Account preferences ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


def utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


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
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
