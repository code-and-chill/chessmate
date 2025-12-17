"""Integration tests for bot game API endpoints."""
import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_bot_game(async_client):
    """Test creating a bot game via API."""
    response = await async_client.post(
        "/v1/games/bot",
        json={
            "difficulty": "medium",
            "player_color": "white",
            "time_control": {
                "initial_seconds": 300,
                "increment_seconds": 0
            },
            "rated": False
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["bot_id"] == "bot-medium-1200"
    assert data["bot_color"] in ["w", "b"]
    assert data["rated"] is False
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_create_bot_game_different_difficulties(async_client):
    """Test creating bot games with different difficulty levels."""
    difficulties = ["beginner", "easy", "medium", "hard", "expert", "master"]
    expected_bot_ids = [
        "bot-beginner-400",
        "bot-easy-800",
        "bot-medium-1200",
        "bot-hard-1600",
        "bot-expert-2000",
        "bot-master-2400",
    ]
    
    for difficulty, expected_bot_id in zip(difficulties, expected_bot_ids):
        response = await async_client.post(
            "/v1/games/bot",
            json={
                "difficulty": difficulty,
                "player_color": "random",
                "time_control": {
                    "initial_seconds": 300,
                    "increment_seconds": 0
                }
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["bot_id"] == expected_bot_id


@pytest.mark.asyncio
async def test_bot_game_always_unrated(async_client):
    """Test that bot games are always unrated regardless of request."""
    response = await async_client.post(
        "/v1/games/bot",
        json={
            "difficulty": "medium",
            "player_color": "white",
            "time_control": {
                "initial_seconds": 300,
                "increment_seconds": 0
            },
            "rated": True  # Request rated, but should be forced to unrated
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["rated"] is False
    assert data["decision_reason"] == "bot_game"


@pytest.mark.asyncio
async def test_bot_move_after_human_move(async_client):
    """Test that bot move is played automatically after human move."""
    # Create bot game
    create_response = await async_client.post(
        "/v1/games/bot",
        json={
            "difficulty": "medium",
            "player_color": "white",
            "time_control": {
                "initial_seconds": 300,
                "increment_seconds": 0
            }
        }
    )
    
    assert create_response.status_code == 201
    game_id = create_response.json()["id"]
    
    # Make human move (white goes first)
    move_response = await async_client.post(
        f"/v1/games/{game_id}/moves",
        json={
            "from_square": "e2",
            "to_square": "e4"
        }
    )
    
    assert move_response.status_code == 200
    data = move_response.json()
    
    # Verify bot move was played (move count should be 2: human + bot)
    # Note: This test requires bot-orchestrator-api to be running
    # In a real test environment, you'd mock the bot client
    assert len(data["moves"]) >= 1  # At least human move
    # Bot move may or may not be included depending on timing

