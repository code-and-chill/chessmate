"""Test configuration."""
import pytest
import pytest_asyncio
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.infrastructure.database.models import Base
from app.infrastructure.database.connection import DatabaseManager
from app.api.dependencies import get_db_session, get_redis_client
from app.main import app


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create test database engine."""
    # Use in-memory SQLite for testing
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    """Create test database session."""
    async_session = sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def redis_client():
    """Create test Redis client."""
    # Use fakeredis for testing
    from fakeredis import aioredis

    client = aioredis.FakeRedis()
    yield client
    await client.aclose()


@pytest.fixture(autouse=True)
def override_dependencies(db_session, redis_client):
    """Override FastAPI dependencies for testing."""
    
    async def override_get_db():
        yield db_session
    
    async def override_get_redis():
        return redis_client
    
    # Override dependencies
    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[get_redis_client] = override_get_redis
    
    yield
    
    # Clear overrides
    app.dependency_overrides.clear()
