"""API integration tests."""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient


class TestHealthCheck:
    """Test health check endpoint."""

    def test_health_check(self, client: TestClient):
        """Test health check."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "live-game-api"


class TestGamesAPI:
    """Test games API endpoints."""

    def test_create_game(self, client: TestClient):
        """Test creating a game."""
        payload = {
            "time_control": {"initial_seconds": 300, "increment_seconds": 0},
            "color_preference": "white",
            "rated": True,
        }

        response = client.post("/api/v1/games", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "waiting_for_opponent"
        assert data["rated"] is True
        assert data["white_account_id"] is not None
        assert data["black_account_id"] is None

    def test_get_game(self, client: TestClient):
        """Test getting a game."""
        # Create a game first
        payload = {
            "time_control": {"initial_seconds": 300, "increment_seconds": 0},
            "color_preference": "white",
            "rated": True,
        }

        create_response = client.post("/api/v1/games", json=payload)
        game_id = create_response.json()["id"]

        # Fetch the game
        response = client.get(f"/api/v1/games/{game_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == game_id
        assert data["status"] == "waiting_for_opponent"

    def test_get_nonexistent_game(self, client: TestClient):
        """Test getting a non-existent game."""
        nonexistent_id = uuid4()
        response = client.get(f"/api/v1/games/{nonexistent_id}")

        assert response.status_code == 404

    def test_create_game_with_opponent(self, client: TestClient):
        """Test creating a game with specific opponent."""
        opponent_id = uuid4()
        payload = {
            "opponent_account_id": str(opponent_id),
            "time_control": {"initial_seconds": 300, "increment_seconds": 0},
            "color_preference": "white",
            "rated": True,
        }

        response = client.post("/api/v1/games", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "waiting_for_opponent"
        # White should be assigned to creator
        assert data["white_account_id"] is not None
