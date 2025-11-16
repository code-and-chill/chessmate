"""
Database connection and session management.

This module provides the core database infrastructure including:
- Async SQLAlchemy engine configuration
- Session management and pooling
- ORM base class for models
- Database lifecycle management
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()

# Base class for ORM models
Base = declarative_base()

# Import all ORM models to ensure they are registered with SQLAlchemy
# This is required for Base.metadata.create_all() to work correctly
from app.infrastructure.database.models.account_orm import AccountORM  # noqa: E402, F401
from app.infrastructure.database.models.account_media_orm import AccountMediaORM  # noqa: E402, F401
from app.infrastructure.database.models.account_preferences_orm import AccountPreferencesORM  # noqa: E402, F401
from app.infrastructure.database.models.account_privacy_settings_orm import AccountPrivacySettingsORM  # noqa: E402, F401
from app.infrastructure.database.models.account_profile_details_orm import AccountProfileDetailsORM  # noqa: E402, F401
from app.infrastructure.database.models.account_social_counters_orm import AccountSocialCountersORM  # noqa: E402, F401

# Create async engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
    pool_pre_ping=True,  # Enable connection health checks
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class DatabaseManager:
    """
    Database connection lifecycle manager.
    
    Handles database connection initialization and cleanup during
    application startup and shutdown.
    """

    async def connect(self) -> None:
        """
        Initialize database connection and create tables.
        
        Creates all tables defined in ORM models if they don't exist.
        Should be called during application startup.
        """
        logger.info("database.connect.started")
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("database.connect.success")
        except Exception as e:
            logger.error("database.connect.failed", error=str(e), exc_info=True)
            raise

    async def disconnect(self) -> None:
        """
        Close database connections and cleanup resources.
        
        Disposes the engine and closes all database connections.
        Should be called during application shutdown.
        """
        logger.info("database.disconnect.started")
        try:
            await engine.dispose()
            logger.info("database.disconnect.success")
        except Exception as e:
            logger.error("database.disconnect.failed", error=str(e), exc_info=True)
            raise


# Global database manager instance
database_manager = DatabaseManager()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide database session for dependency injection.
    
    Creates a new database session for each request and ensures
    proper cleanup after the request completes.
    
    Yields:
        AsyncSession: SQLAlchemy async database session
        
    Example:
        ```python
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db_session)):
            result = await db.execute(select(User))
            return result.scalars().all()
        ```
    """
    async with AsyncSessionLocal() as session:
        try:
            logger.debug("database.session.created")
            yield session
            await session.commit()
        except Exception as e:
            logger.error("database.session.error", error=str(e), exc_info=True)
            await session.rollback()
            raise
        finally:
            await session.close()
            logger.debug("database.session.closed")
