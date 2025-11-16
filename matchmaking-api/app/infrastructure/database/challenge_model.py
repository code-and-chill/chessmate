"""Challenge ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


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
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("idx_challenges_tenant_opponent", "tenant_id", "opponent_user_id"),
    )
