"""Database connection manager."""
import logging
from typing import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages database connections."""

    def __init__(self) -> None:
        self.engine = None
        self.async_session = None

    async def connect(self) -> None:
        """Initialize database connection."""
        settings = get_settings()

        self.engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DATABASE_ECHO,
            pool_size=settings.DATABASE_POOL_SIZE,
            max_overflow=settings.DATABASE_MAX_OVERFLOW,
            pool_timeout=settings.DATABASE_POOL_TIMEOUT,
            pool_recycle=3600,
            pool_pre_ping=True,
        )

        self.async_session = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

        logger.info("Database connected")

    async def disconnect(self) -> None:
        """Disconnect from database."""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database disconnected")

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get async session.

        Yields:
            AsyncSession instance
        """
        if not self.async_session:
            raise RuntimeError("Database not initialized. Call connect() first.")

        async with self.async_session() as session:
            yield session


database_manager = DatabaseManager()
