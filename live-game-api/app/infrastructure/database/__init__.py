"""Database connection management."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.infrastructure.database.models import Base

settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class DatabaseManager:
    """Database connection manager."""

    async def connect(self) -> None:
        """Connect to database and create tables."""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def disconnect(self) -> None:
        """Disconnect from database."""
        await engine.dispose()


database_manager = DatabaseManager()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session dependency."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
