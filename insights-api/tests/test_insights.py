from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/insights/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_overview():
    response = client.get("/insights/v1/players/player-123/overview")
    assert response.status_code == 200
    body = response.json()
    assert body["playerId"] == "player-123"
    assert body["summary"]["totalGames"] == 900


def test_performance_not_found():
    response = client.get("/insights/v1/players/unknown/performance")
    assert response.status_code == 404


def test_rating_trend():
    response = client.get("/insights/v1/players/player-123/rating-trend", params={"timeControlBucket": "BLITZ", "maxPoints": 2})
    assert response.status_code == 200
    assert len(response.json()["points"]) == 2


def test_recent_form_limit():
    response = client.get("/insights/v1/players/player-123/recent-form", params={"limit": 1})
    assert response.status_code == 200
    assert len(response.json()["results"]) == 1
