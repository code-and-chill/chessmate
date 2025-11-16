"""Account social counters ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


def utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


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
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
