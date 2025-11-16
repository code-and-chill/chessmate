"""
Integration test for account creation and management end-to-end flow.

This test verifies the complete account lifecycle:
1. Create account (internal API)
2. Get account by auth_user_id
3. Update account preferences
4. Update profile details
5. Get full account data
"""

import uuid
from datetime import datetime

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.core.security import create_token
from app.infrastructure.database import Base
from app.main import app

settings = get_settings()

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
)

# Create test session factory
TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest.fixture
async def test_db():
    """Create test database and tables."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client(test_db):
    """Create test client."""
    from app.infrastructure.database import get_db_session
    from httpx import ASGITransport
    
    async def override_get_db():
        async with TestSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    app.dependency_overrides[get_db_session] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
def auth_user_id():
    """Generate a test auth user ID."""
    return uuid.uuid4()


@pytest.fixture
def test_username():
    """Generate a unique test username."""
    return f"testuser_{uuid.uuid4().hex[:8]}"


@pytest.fixture
def auth_token(auth_user_id):
    """Generate a test JWT token."""
    return create_token({"sub": str(auth_user_id)})


@pytest.mark.asyncio
async def test_account_creation_flow(client, auth_user_id, test_username):
    """Test complete account creation and retrieval flow."""
    
    # Step 1: Create account via internal API
    create_payload = {
        "auth_user_id": str(auth_user_id),
        "username": test_username,
        "display_name": "Test User",
        "country_code": "US",
        "language_code": "en",
        "time_zone": "America/New_York",
    }
    
    response = await client.post("/internal/accounts", json=create_payload)
    assert response.status_code == 201 or response.status_code == 200
    account_data = response.json()
    
    assert "account_id" in account_data
    assert account_data["username"] == test_username
    
    account_id = account_data["account_id"]
    
    # Step 2: Get account by auth_user_id
    response = await client.get(f"/internal/accounts/by-auth-user/{auth_user_id}")
    assert response.status_code == 200
    
    account_info = response.json()
    assert account_info["account_id"] == account_id
    assert account_info["username"] == test_username
    assert account_info["display_name"] == "Test User"
    assert account_info["is_active"] is True
    assert account_info["is_banned"] is False
    
    # Step 3: Get full account by ID
    response = await client.get(f"/internal/accounts/{account_id}")
    assert response.status_code == 200
    
    full_account = response.json()
    assert "account" in full_account
    assert "profile_details" in full_account
    assert "media" in full_account
    assert "preferences" in full_account
    assert "privacy_settings" in full_account
    assert "social_counters" in full_account
    
    # Verify account fields
    assert full_account["account"]["username"] == test_username
    assert full_account["account"]["country_code"] == "US"
    assert full_account["account"]["time_zone"] == "America/New_York"
    
    # Verify default preferences
    assert full_account["preferences"]["board_theme"] == "classic"
    assert full_account["preferences"]["sound_enabled"] is True
    
    # Verify default privacy settings
    assert full_account["privacy_settings"]["is_profile_public"] is True
    
    # Verify default social counters
    assert full_account["social_counters"]["followers_count"] == 0
    assert full_account["social_counters"]["total_games_played"] == 0


@pytest.mark.asyncio
async def test_account_update_flow(client, auth_user_id, test_username, auth_token):
    """Test account update operations."""
    
    # Create account first
    create_payload = {
        "auth_user_id": str(auth_user_id),
        "username": test_username,
        "display_name": "Test User",
    }
    
    response = await client.post("/internal/accounts", json=create_payload)
    assert response.status_code in [200, 201]
    
    # Step 1: Update account via authenticated endpoint
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    update_payload = {
        "display_name": "Updated Name",
        "country_code": "CA",
    }
    
    response = await client.patch("/v1/accounts/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    
    updated_account = response.json()
    assert updated_account["account"]["display_name"] == "Updated Name"
    assert updated_account["account"]["country_code"] == "CA"
    
    # Step 2: Update profile details
    profile_payload = {
        "bio": "This is my test bio",
        "location_text": "Toronto, Canada",
        "website_url": "https://example.com",
    }
    
    response = await client.patch(
        "/v1/accounts/me/profile",
        json=profile_payload,
        headers=headers
    )
    assert response.status_code == 200
    
    profile = response.json()
    assert profile["bio"] == "This is my test bio"
    assert profile["location_text"] == "Toronto, Canada"
    
    # Step 3: Update preferences
    preferences_payload = {
        "sound_enabled": False,
        "highlight_legal_moves": False,
        "confirm_moves": True,
    }
    
    response = await client.patch(
        "/v1/accounts/me/preferences",
        json=preferences_payload,
        headers=headers
    )
    assert response.status_code == 200
    
    preferences = response.json()
    assert preferences["sound_enabled"] is False
    assert preferences["highlight_legal_moves"] is False
    assert preferences["confirm_moves"] is True
    
    # Step 4: Update privacy settings
    privacy_payload = {
        "show_online_status": False,
        "is_profile_public": False,
    }
    
    response = await client.patch(
        "/v1/accounts/me/privacy",
        json=privacy_payload,
        headers=headers
    )
    assert response.status_code == 200
    
    privacy = response.json()
    assert privacy["show_online_status"] is False
    assert privacy["is_profile_public"] is False


@pytest.mark.asyncio
async def test_public_profile_access(client, auth_user_id, test_username, auth_token):
    """Test public profile access with privacy settings."""
    
    # Create account
    create_payload = {
        "auth_user_id": str(auth_user_id),
        "username": test_username,
        "display_name": "Public User",
    }
    
    response = await client.post("/internal/accounts", json=create_payload)
    assert response.status_code in [200, 201]
    
    # Step 1: Access public profile when it's public
    response = await client.get(f"/v1/accounts/{test_username}")
    assert response.status_code == 200
    
    public_profile = response.json()
    assert "account" in public_profile
    assert "profile_details" in public_profile
    assert "media" in public_profile
    assert "social_counters" in public_profile
    # Privacy settings and preferences should NOT be in public profile
    assert "privacy_settings" not in public_profile
    assert "preferences" not in public_profile
    
    # Step 2: Make profile private
    headers = {"Authorization": f"Bearer {auth_token}"}
    privacy_payload = {"is_profile_public": False}
    
    response = await client.patch(
        "/v1/accounts/me/privacy",
        json=privacy_payload,
        headers=headers
    )
    assert response.status_code == 200
    
    # Step 3: Try to access private profile
    response = await client.get(f"/v1/accounts/{test_username}")
    assert response.status_code == 404  # Profile not found when private


@pytest.mark.asyncio
async def test_account_admin_operations(client, auth_user_id, test_username):
    """Test admin operations like ban/unban/deactivate."""
    
    # Create account
    create_payload = {
        "auth_user_id": str(auth_user_id),
        "username": test_username,
        "display_name": "Test User",
    }
    
    response = await client.post("/internal/accounts", json=create_payload)
    assert response.status_code in [200, 201]
    account_id = response.json()["account_id"]
    
    # Step 1: Ban account
    response = await client.post(f"/internal/accounts/{account_id}/ban")
    assert response.status_code == 200
    
    ban_result = response.json()
    assert ban_result["is_banned"] is True
    
    # Verify ban status
    response = await client.get(f"/internal/accounts/by-auth-user/{auth_user_id}")
    assert response.status_code == 200
    assert response.json()["is_banned"] is True
    
    # Step 2: Unban account
    response = await client.post(f"/internal/accounts/{account_id}/unban")
    assert response.status_code == 200
    
    unban_result = response.json()
    assert unban_result["is_banned"] is False
    
    # Step 3: Deactivate account
    response = await client.post(f"/internal/accounts/{account_id}/deactivate")
    assert response.status_code == 200
    
    deactivate_result = response.json()
    assert deactivate_result["is_active"] is False


@pytest.mark.asyncio
async def test_duplicate_account_creation(client, auth_user_id, test_username):
    """Test that duplicate account creation is prevented."""
    
    create_payload = {
        "auth_user_id": str(auth_user_id),
        "username": test_username,
        "display_name": "Test User",
    }
    
    # Create account first time
    response = await client.post("/internal/accounts", json=create_payload)
    assert response.status_code in [200, 201]
    
    # Try to create duplicate
    response = await client.post("/internal/accounts", json=create_payload)
    assert response.status_code == 409  # Conflict


@pytest.mark.asyncio
async def test_invalid_username(client):
    """Test username validation."""
    
    invalid_usernames = [
        "ab",  # Too short
        "a" * 33,  # Too long
        "user@name",  # Invalid character
        "user name",  # Spaces
        "user!",  # Special character
    ]
    
    for invalid_username in invalid_usernames:
        create_payload = {
            "auth_user_id": str(uuid.uuid4()),
            "username": invalid_username,
            "display_name": "Test User",
        }
        
        response = await client.post("/internal/accounts", json=create_payload)
        assert response.status_code in [400, 422]  # Bad request or validation error


@pytest.mark.asyncio
async def test_health_check(client):
    """Test health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    
    health_data = response.json()
    assert health_data["status"] == "ok"
    assert "service" in health_data

