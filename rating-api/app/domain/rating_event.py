"""Rating event ORM model."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class RatingEvent(Base):
    """Rating change event (audit log)."""

    __tablename__ = "rating_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    pool_id: Mapped[int] = mapped_column(Integer, ForeignKey("rating_pool.id", ondelete="RESTRICT"))
    game_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    old_rating: Mapped[float] = mapped_column(Float)
    new_rating: Mapped[float] = mapped_column(Float)
    old_rd: Mapped[float] = mapped_column(Float)
    new_rd: Mapped[float] = mapped_column(Float)
    old_volatility: Mapped[float] = mapped_column(Float)
    new_volatility: Mapped[float] = mapped_column(Float)
    reason: Mapped[str] = mapped_column(String(32))  # game | admin_adjustment | recompute
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
