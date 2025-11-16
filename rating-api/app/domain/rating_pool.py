"""Rating pool ORM model."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class RatingPool(Base):
    """Rating pool configuration."""

    __tablename__ = "rating_pool"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    time_control_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    time_control_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    variant: Mapped[str] = mapped_column(String(32), default="standard")
    mode: Mapped[str] = mapped_column(String(32), default="normal")
    rating_system: Mapped[str] = mapped_column(String(16), default="glicko2")
    initial_rating: Mapped[float] = mapped_column(Float, default=1500.0)
    glicko_tau: Mapped[float] = mapped_column(Float, default=0.5)
    glicko_default_rd: Mapped[float] = mapped_column(Float, default=350.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
