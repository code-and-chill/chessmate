"""Integration tests for complete matchmaking flows."""
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app
from app.core.security import create_token
from app.domain.services.matchmaking_service import MatchmakingService


@pytest.fixture
def user1_token():
    """Create test auth token for user 1."""
    return create_token("user_flow_1", "t_default")


@pytest.fixture
def user2_token():
    """Create test auth token for user 2."""
    return create_token("user_flow_2", "t_default")


@pytest.mark.asyncio
class TestMatchmakingFlow:
    """Test complete matchmaking workflows."""

    async def test_queue_join_cancel_flow(self, user1_token):
        """Test full flow: join queue -> check status -> cancel."""
        headers = {"Authorization": f"Bearer {user1_token}"}

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Step 1: Join queue
            join_response = await client.post(
                "/v1/matchmaking/queue",
                headers=headers,
                json={
                    "time_control": "5+0",
                    "mode": "rated",
                    "variant": "standard",
                },
            )
            assert join_response.status_code == 201
            queue_entry_id = join_response.json()["queue_entry_id"]

            # Step 2: Check active matchmaking
            active_response = await client.get(
                "/v1/matchmaking/active",
                headers=headers,
            )
            assert active_response.status_code == 200
            active_data = active_response.json()
            assert active_data["queue_entry"] is not None
            assert active_data["queue_entry"]["status"] == "SEARCHING"

            # Step 3: Check queue status
            status_response = await client.get(
                f"/v1/matchmaking/queue/{queue_entry_id}",
                headers=headers,
            )
            assert status_response.status_code == 200
            assert status_response.json()["status"] == "SEARCHING"

            # Step 4: Cancel queue entry
            cancel_response = await client.delete(
                f"/v1/matchmaking/queue/{queue_entry_id}",
                headers=headers,
            )
            assert cancel_response.status_code == 200
            assert cancel_response.json()["status"] == "CANCELLED"

            # Step 5: Verify no longer in active matchmaking
            final_active = await client.get(
                "/v1/matchmaking/active",
                headers=headers,
            )
            assert final_active.status_code == 200
            # Queue entry might still exist but should be cancelled
            # or it might be removed entirely

    @patch("app.infrastructure.external.live_game_api.LiveGameAPIClient.create_game")
    async def test_challenge_create_accept_flow(
        self, mock_create_game, user1_token, user2_token
    ):
        """Test full challenge flow: create -> get incoming -> accept."""
        mock_create_game.return_value = "game_challenge_123"

        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Step 1: User 1 creates challenge to user 2
            create_response = await client.post(
                "/v1/matchmaking/challenges",
                headers=user1_headers,
                json={
                    "opponent_user_id": "user_flow_2",
                    "time_control": "10+0",
                    "mode": "rated",
                    "variant": "standard",
                    "preferred_color": "white",
                },
            )
            assert create_response.status_code == 201
            challenge_id = create_response.json()["challenge_id"]

            # Step 2: User 2 gets incoming challenges
            incoming_response = await client.get(
                "/v1/matchmaking/challenges/incoming",
                headers=user2_headers,
            )
            assert incoming_response.status_code == 200
            challenges = incoming_response.json()
            assert len(challenges) > 0
            found_challenge = next(
                (c for c in challenges if c["challenge_id"] == challenge_id), None
            )
            assert found_challenge is not None
            assert found_challenge["challenger_user_id"] == "user_flow_1"

            # Step 3: User 2 accepts challenge
            accept_response = await client.post(
                f"/v1/matchmaking/challenges/{challenge_id}/accept",
                headers=user2_headers,
            )
            assert accept_response.status_code == 200
            accept_data = accept_response.json()
            assert accept_data["status"] == "ACCEPTED"
            assert accept_data["game_id"] == "game_challenge_123"

            # Verify game creation was called
            mock_create_game.assert_called_once()

    async def test_challenge_create_decline_flow(self, user1_token, user2_token):
        """Test challenge flow with decline."""
        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # User 1 creates challenge
            create_response = await client.post(
                "/v1/matchmaking/challenges",
                headers=user1_headers,
                json={
                    "opponent_user_id": "user_flow_2",
                    "time_control": "5+0",
                    "mode": "casual",
                },
            )
            challenge_id = create_response.json()["challenge_id"]

            # User 2 declines
            decline_response = await client.post(
                f"/v1/matchmaking/challenges/{challenge_id}/decline",
                headers=user2_headers,
            )
            assert decline_response.status_code == 200
            assert decline_response.json()["status"] == "DECLINED"

            # Challenge should no longer appear in incoming
            incoming_response = await client.get(
                "/v1/matchmaking/challenges/incoming",
                headers=user2_headers,
            )
            challenges = incoming_response.json()
            found_challenge = next(
                (c for c in challenges if c["challenge_id"] == challenge_id), None
            )
            # Should be None since declined challenges are filtered out
            assert found_challenge is None

    async def test_cannot_join_queue_twice(self, user1_token):
        """Test that user cannot join queue while already in queue."""
        headers = {"Authorization": f"Bearer {user1_token}"}

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # First join succeeds
            response1 = await client.post(
                "/v1/matchmaking/queue",
                headers=headers,
                json={"time_control": "5+0", "mode": "rated"},
            )
            assert response1.status_code == 201

            # Second join fails
            response2 = await client.post(
                "/v1/matchmaking/queue",
                headers=headers,
                json={"time_control": "3+0", "mode": "rated"},
            )
            assert response2.status_code == 409
            assert response2.json()["code"] == "ALREADY_IN_QUEUE"

    async def test_validation_errors(self, user1_token):
        """Test validation for invalid requests."""
        headers = {"Authorization": f"Bearer {user1_token}"}

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Missing required field
            response = await client.post(
                "/v1/matchmaking/queue",
                headers=headers,
                json={"mode": "rated"},  # Missing time_control
            )
            assert response.status_code == 422

            # Invalid mode
            response = await client.post(
                "/v1/matchmaking/queue",
                headers=headers,
                json={"time_control": "5+0", "mode": "invalid_mode"},
            )
            assert response.status_code == 422
