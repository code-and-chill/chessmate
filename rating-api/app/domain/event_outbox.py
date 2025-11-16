"""Event outbox ORM model."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class EventOutbox(Base):
    """Outbox pattern for reliable event publishing."""

    __tablename__ = "event_outbox"
    __table_args__ = (
        UniqueConstraint("aggregate_id", "event_type", "event_key", name="uq_outbox_dedup"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(64))  # rating.updated
    aggregate_id: Mapped[str] = mapped_column(String(128))  # user_id:pool_code
    event_key: Mapped[str] = mapped_column(String(128))  # game_id or recompute batch
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
