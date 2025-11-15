from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings


Base = declarative_base()


# Lazily initialized engine/session to honor runtime environment variables
_engine: Optional[AsyncEngine] = None
_SessionLocal: Optional[sessionmaker] = None


class DatabaseManager:
    async def connect(self) -> None:
        global _engine, _SessionLocal

        # Import models to register metadata
        from app.domain import models  # noqa: F401

        settings = get_settings()

        url = settings.DATABASE_URL
        engine_kwargs = {
            "echo": settings.DEBUG,
        }
        if not url.startswith("sqlite"):
            engine_kwargs.update(
                {
                    "pool_size": settings.DATABASE_POOL_SIZE,
                    "max_overflow": settings.DATABASE_MAX_OVERFLOW,
                }
            )
        _engine = create_async_engine(url, **engine_kwargs)
        _SessionLocal = sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)

        async with _engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def disconnect(self) -> None:
        global _engine, _SessionLocal
        if _engine is not None:
            await _engine.dispose()
        _engine = None
        _SessionLocal = None


database_manager = DatabaseManager()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    if _SessionLocal is None:
        # If not initialized (e.g., missing lifespan), initialize with current settings
        await database_manager.connect()
    assert _SessionLocal is not None  # for type checkers
    async with _SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
