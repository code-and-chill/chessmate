"""Pytest configuration."""

import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock
from uuid import UUID

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.api.dependencies import get_current_user, get_game_service
from app.infrastructure.database import Base, get_db_session
from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_engine():
    """Create test database engine."""
    # Import all ORM models to ensure they're registered with Base
    from app.infrastructure.database.game_orm import GameORM
    from app.infrastructure.database.game_move_orm import GameMoveORM
    
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    AsyncSessionLocal = sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with AsyncSessionLocal() as session:
        yield session
        await session.rollback()


@pytest.fixture
def client(db_session: AsyncSession):
    """Create test client with database override."""
    from fastapi.testclient import TestClient
    from contextlib import nullcontext

    # Store current user ID in a list so it can be modified
    current_user_id = [UUID("12345678-1234-5678-1234-567812345678")]

    async def override_get_db():
        yield db_session

    async def override_get_current_user():
        # Use the current user ID from the list
        return current_user_id[0]

    # Create app without lifespan to avoid PostgreSQL connection
    from app.main import create_app
    from contextlib import asynccontextmanager
    
    @asynccontextmanager
    async def empty_lifespan(app):
        """Empty lifespan for tests."""
        yield
    
    # Temporarily replace lifespan
    original_lifespan = app.router.lifespan_context
    app.router.lifespan_context = empty_lifespan

    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        # Expose the current_user_id list so tests can modify it
        test_client.set_user_id = lambda user_id: current_user_id.__setitem__(0, user_id)
        yield test_client

    # Restore
    app.router.lifespan_context = original_lifespan
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client."""
    async def override_get_db():
        yield db_session

    async def override_get_current_user():
        return UUID("12345678-1234-5678-1234-567812345678")

    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
