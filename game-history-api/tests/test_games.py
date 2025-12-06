from uuid import UUID

from fastapi.testclient import TestClient

from app.main import app, repository

client = TestClient(app)


def setup_function() -> None:  # type: ignore
    repository.clear()


def test_record_and_get_game() -> None:
    payload = {
        "gameId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "whitePlayerId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "blackPlayerId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "result": "DRAW",
        "timeControl": "5+0",
        "timeControlBucket": "BLITZ",
        "mode": "CASUAL",
        "endedAt": "2025-12-06T11:00:00Z",
        "moves": 80,
    }

    create_response = client.post("/api/v1/games", json=payload)
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["gameId"] == payload["gameId"]
    assert repository.games_count() == 1

    game_id = UUID(payload["gameId"])
    get_response = client.get(f"/api/v1/games/{game_id}")
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["result"] == "DRAW"
    assert fetched["moves"] == 80


def test_list_games_by_player_orders_newest_first() -> None:
    first_game = {
        "whitePlayerId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "blackPlayerId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "result": "WHITE_WIN",
        "timeControl": "3+0",
        "timeControlBucket": "BLITZ",
        "mode": "RATED",
        "endedAt": "2025-12-06T09:00:00Z",
        "moves": 30,
    }
    second_game = {
        "whitePlayerId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "blackPlayerId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "result": "BLACK_WIN",
        "timeControl": "10+0",
        "timeControlBucket": "RAPID",
        "mode": "RATED",
        "endedAt": "2025-12-06T11:00:00Z",
        "moves": 60,
    }

    client.post("/api/v1/games", json=first_game)
    client.post("/api/v1/games", json=second_game)

    response = client.get(
        "/api/v1/players/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/games",
        params={"limit": 5},
    )
    assert response.status_code == 200
    games = response.json()
    assert len(games) == 2
    assert games[0]["timeControlBucket"] == "RAPID"
    assert games[1]["timeControlBucket"] == "BLITZ"
