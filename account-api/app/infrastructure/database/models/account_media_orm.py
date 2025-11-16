"""Account media ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.infrastructure.database import Base


def utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


class AccountMediaORM(Base):
    """Account media ORM model."""

    __tablename__ = "account_media"

    account_id = Column(PGUUID(as_uuid=True), primary_key=True, nullable=False)
    avatar_file_id = Column(PGUUID(as_uuid=True), nullable=True)
    banner_file_id = Column(PGUUID(as_uuid=True), nullable=True)
    avatar_version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
