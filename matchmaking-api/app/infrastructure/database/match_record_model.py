"""Match record ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, String
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
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("idx_match_records_tenant_game", "tenant_id", "game_id"),
        Index("idx_match_records_game", "game_id"),
    )
