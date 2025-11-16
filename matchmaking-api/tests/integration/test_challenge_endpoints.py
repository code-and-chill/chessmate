"""Integration tests for challenge endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app
from app.core.security import create_token


@pytest.fixture
def auth_token_user1():
    """Create test auth token for user 1."""
    return create_token("user_1", "t_default")


@pytest.fixture
def auth_token_user2():
    """Create test auth token for user 2."""
    return create_token("user_2", "t_default")


@pytest.fixture
def auth_headers_user1(auth_token_user1):
    """Create auth headers for user 1."""
    return {"Authorization": f"Bearer {auth_token_user1}"}


@pytest.fixture
def auth_headers_user2(auth_token_user2):
    """Create auth headers for user 2."""
    return {"Authorization": f"Bearer {auth_token_user2}"}


@pytest.mark.asyncio
class TestChallengeEndpoints:
    """Test challenge API endpoints."""

    async def test_create_challenge_success(self, auth_headers_user1):
        """Test successfully creating a challenge."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/v1/matchmaking/challenges",
                headers=auth_headers_user1,
                json={
                    "opponent_user_id": "user_2",
                    "time_control": "10+0",
                    "mode": "rated",
                    "variant": "standard",
                    "preferred_color": "random",
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert "challenge_id" in data
            assert data["status"] == "PENDING"

    async def test_create_challenge_self(self, auth_headers_user1):
        """Test creating challenge to oneself fails."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/v1/matchmaking/challenges",
                headers=auth_headers_user1,
                json={
                    "opponent_user_id": "user_1",  # Same as challenger
                    "time_control": "10+0",
                    "mode": "rated",
                },
            )

            assert response.status_code == 400
            assert "SELF_CHALLENGE" in response.json().get("code", "")

    async def test_get_incoming_challenges_empty(self, auth_headers_user2):
        """Test getting incoming challenges when there are none."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(
                "/v1/matchmaking/challenges/incoming",
                headers=auth_headers_user2,
            )

            assert response.status_code == 200
            assert isinstance(response.json(), list)
            assert len(response.json()) == 0

    async def test_get_incoming_challenges_with_challenge(
        self, auth_headers_user1, auth_headers_user2
    ):
        """Test getting incoming challenges when one exists."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # User 1 creates challenge to user 2
            await client.post(
                "/v1/matchmaking/challenges",
                headers=auth_headers_user1,
                json={
                    "opponent_user_id": "user_2",
                    "time_control": "10+0",
                    "mode": "rated",
                },
            )

            # User 2 gets incoming challenges
            response = await client.get(
                "/v1/matchmaking/challenges/incoming",
                headers=auth_headers_user2,
            )

            assert response.status_code == 200
            challenges = response.json()
            assert len(challenges) > 0
            assert challenges[0]["challenger_user_id"] == "user_1"

    @patch("app.infrastructure.external.live_game_api.LiveGameAPIClient.create_game")
    async def test_accept_challenge_success(
        self, mock_create_game, auth_headers_user1, auth_headers_user2
    ):
        """Test successfully accepting a challenge."""
        mock_create_game.return_value = "game_123"

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # User 1 creates challenge
            create_response = await client.post(
                "/v1/matchmaking/challenges",
                headers=auth_headers_user1,
                json={
                    "opponent_user_id": "user_2",
                    "time_control": "10+0",
                    "mode": "rated",
                },
            )
            challenge_id = create_response.json()["challenge_id"]

            # User 2 accepts
            response = await client.post(
                f"/v1/matchmaking/challenges/{challenge_id}/accept",
                headers=auth_headers_user2,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["challenge_id"] == challenge_id
            assert data["status"] == "ACCEPTED"
            assert "game_id" in data

    async def test_accept_challenge_wrong_user(
        self, auth_headers_user1
    ):
        """Test accepting challenge as non-recipient fails."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # User 1 creates challenge to user 2
            create_response = await client.post(
                "/v1/matchmaking/challenges",
                headers=auth_headers_user1,
                json={
                    "opponent_user_id": "user_2",
                    "time_control": "10+0",
                    "mode": "rated",
                },
            )
            challenge_id = create_response.json()["challenge_id"]

            # User 1 tries to accept their own challenge
            response = await client.post(
                f"/v1/matchmaking/challenges/{challenge_id}/accept",
                headers=auth_headers_user1,
            )

            assert response.status_code == 403

    async def test_decline_challenge_success(
        self, auth_headers_user1, auth_headers_user2
    ):
        """Test successfully declining a challenge."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # User 1 creates challenge
            create_response = await client.post(
                "/v1/matchmaking/challenges",
                headers=auth_headers_user1,
                json={
                    "opponent_user_id": "user_2",
                    "time_control": "10+0",
                    "mode": "rated",
                },
            )
            challenge_id = create_response.json()["challenge_id"]

            # User 2 declines
            response = await client.post(
                f"/v1/matchmaking/challenges/{challenge_id}/decline",
                headers=auth_headers_user2,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["challenge_id"] == challenge_id
            assert data["status"] == "DECLINED"

    async def test_decline_challenge_not_found(self, auth_headers_user2):
        """Test declining non-existent challenge."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/v1/matchmaking/challenges/c_nonexistent/decline",
                headers=auth_headers_user2,
            )

            assert response.status_code == 404
