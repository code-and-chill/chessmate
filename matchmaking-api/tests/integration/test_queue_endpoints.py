"""Integration tests for queue endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app
from app.core.security import create_token


@pytest.fixture
def auth_token():
    """Create test auth token."""
    return create_token("test_user_123", "t_default")


@pytest.fixture
def auth_headers(auth_token):
    """Create auth headers."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.mark.asyncio
class TestQueueEndpoints:
    """Test queue API endpoints."""

    async def test_join_queue_success(self, auth_headers):
        """Test successfully joining matchmaking queue."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/v1/matchmaking/queue",
                headers=auth_headers,
                json={
                    "time_control": "5+0",
                    "mode": "rated",
                    "variant": "standard",
                    "region": "DEFAULT",
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert "queue_entry_id" in data
            assert data["status"] == "SEARCHING"
            assert "estimated_wait_seconds" in data

    async def test_join_queue_missing_auth(self):
        """Test joining queue without authentication."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/v1/matchmaking/queue",
                json={
                    "time_control": "5+0",
                    "mode": "rated",
                },
            )

            assert response.status_code == 422  # Validation error for missing header

    async def test_join_queue_invalid_token(self):
        """Test joining queue with invalid token."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/v1/matchmaking/queue",
                headers={"Authorization": "Bearer invalid_token"},
                json={
                    "time_control": "5+0",
                    "mode": "rated",
                },
            )

            assert response.status_code == 401

    async def test_join_queue_already_in_queue(self, auth_headers):
        """Test joining queue when already in queue."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # First request succeeds
            response1 = await client.post(
                "/v1/matchmaking/queue",
                headers=auth_headers,
                json={"time_control": "5+0", "mode": "rated"},
            )
            assert response1.status_code == 201

            # Second request fails
            response2 = await client.post(
                "/v1/matchmaking/queue",
                headers=auth_headers,
                json={"time_control": "5+0", "mode": "rated"},
            )
            assert response2.status_code == 409
            assert "ALREADY_IN_QUEUE" in response2.json().get("code", "")

    async def test_get_queue_status(self, auth_headers):
        """Test getting queue entry status."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Join queue first
            join_response = await client.post(
                "/v1/matchmaking/queue",
                headers=auth_headers,
                json={"time_control": "5+0", "mode": "rated"},
            )
            queue_entry_id = join_response.json()["queue_entry_id"]

            # Get status
            response = await client.get(
                f"/v1/matchmaking/queue/{queue_entry_id}",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["queue_entry_id"] == queue_entry_id
            assert data["status"] in ["SEARCHING", "MATCHED", "CANCELLED", "TIMED_OUT"]

    async def test_get_queue_status_not_found(self, auth_headers):
        """Test getting status for non-existent queue entry."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(
                "/v1/matchmaking/queue/q_nonexistent",
                headers=auth_headers,
            )

            assert response.status_code == 404

    async def test_cancel_queue_entry(self, auth_headers):
        """Test canceling queue entry."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Join queue first
            join_response = await client.post(
                "/v1/matchmaking/queue",
                headers=auth_headers,
                json={"time_control": "5+0", "mode": "rated"},
            )
            queue_entry_id = join_response.json()["queue_entry_id"]

            # Cancel
            response = await client.delete(
                f"/v1/matchmaking/queue/{queue_entry_id}",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["queue_entry_id"] == queue_entry_id
            assert data["status"] == "CANCELLED"

    async def test_cancel_queue_entry_not_found(self, auth_headers):
        """Test canceling non-existent queue entry."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.delete(
                "/v1/matchmaking/queue/q_nonexistent",
                headers=auth_headers,
            )

            assert response.status_code == 404

    async def test_get_active_matchmaking_empty(self, auth_headers):
        """Test getting active matchmaking when user has none."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(
                "/v1/matchmaking/active",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["queue_entry"] is None
            assert data["match"] is None

    async def test_get_active_matchmaking_in_queue(self, auth_headers):
        """Test getting active matchmaking when user is in queue."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Join queue
            await client.post(
                "/v1/matchmaking/queue",
                headers=auth_headers,
                json={"time_control": "5+0", "mode": "rated"},
            )

            # Get active
            response = await client.get(
                "/v1/matchmaking/active",
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["queue_entry"] is not None
            assert data["queue_entry"]["status"] == "SEARCHING"
