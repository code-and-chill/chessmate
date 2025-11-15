"""SQLAlchemy ORM models."""
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Index, String, Text, create_engine
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class MatchRecordModel(Base):
    """Match record ORM model."""

    __tablename__ = "match_records"

    match_id = Column(String(50), primary_key=True, index=True)
    tenant_id = Column(String(50), index=True, nullable=False)
    game_id = Column(String(50), index=True, nullable=False)
    white_user_id = Column(String(50), nullable=False)
    black_user_id = Column(String(50), nullable=False)
    time_control = Column(String(20), nullable=False)
    mode = Column(String(20), nullable=False)
    variant = Column(String(50), nullable=False)
    rating_snapshot = Column(JSON, nullable=True)
    queue_entry_ids = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_match_records_tenant_game", "tenant_id", "game_id"),
        Index("idx_match_records_game", "game_id"),
    )


class ChallengeModel(Base):
    """Challenge ORM model."""

    __tablename__ = "challenges"

    challenge_id = Column(String(50), primary_key=True, index=True)
    tenant_id = Column(String(50), index=True, nullable=False)
    challenger_user_id = Column(String(50), index=True, nullable=False)
    opponent_user_id = Column(String(50), index=True, nullable=False)
    time_control = Column(String(20), nullable=False)
    mode = Column(String(20), nullable=False)
    variant = Column(String(50), nullable=False)
    preferred_color = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    game_id = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("idx_challenges_tenant_opponent", "tenant_id", "opponent_user_id"),
    )
