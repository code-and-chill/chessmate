"""
Test configuration and fixtures for account-api tests.

This module provides pytest fixtures for testing including:
- Event loop configuration for async tests
- Test database session with in-memory SQLite
- HTTP test client with dependency overrides
"""

import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.infrastructure.database import Base, get_db_session
from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> asyncio.AbstractEventLoop:
    """
    Create event loop for async tests.
    
    Provides a session-scoped event loop that can be shared across
    all async test functions in the test session.
    
    Yields:
        asyncio.AbstractEventLoop: Event loop for async operations
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create test database session with in-memory SQLite.
    
    Creates a fresh in-memory database for each test, ensuring test isolation.
    The database is automatically created with all tables and disposed after use.
    
    Yields:
        AsyncSession: SQLAlchemy async database session for testing
        
    Example:
        ```python
        async def test_create_account(db_session: AsyncSession):
            account = Account(...)
            db_session.add(account)
            await db_session.commit()
        ```
    """
    # Use in-memory SQLite for tests
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with AsyncSessionLocal() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create HTTP test client with database dependency override.
    
    Provides an async HTTP client for testing API endpoints with the
    test database session injected as a dependency override.
    
    Args:
        db_session: Test database session to inject
        
    Yields:
        AsyncClient: HTTP client for making test requests
        
    Example:
        ```python
        async def test_get_account(client: AsyncClient):
            response = await client.get("/v1/accounts/me")
            assert response.status_code == 200
        ```
    """

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
