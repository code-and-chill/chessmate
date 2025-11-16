"""User rating ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class UserRating(Base):
    """User's rating in a specific pool."""

    __tablename__ = "user_rating"
    __table_args__ = (
        UniqueConstraint("user_id", "pool_id", name="uq_user_pool"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    pool_id: Mapped[int] = mapped_column(Integer, ForeignKey("rating_pool.id", ondelete="RESTRICT"))
    rating: Mapped[float] = mapped_column(Float, default=1500.0)
    rating_deviation: Mapped[float] = mapped_column(Float, default=350.0)
    volatility: Mapped[float] = mapped_column(Float, default=0.06)
    games_played: Mapped[int] = mapped_column(Integer, default=0)
    provisional: Mapped[bool] = mapped_column(Boolean, default=True)
    locked: Mapped[bool] = mapped_column(Boolean, default=False)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
