import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, engine, Base

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_db():
    """Create test database tables before each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_get_daily_puzzle_not_found(setup_db):
    """Test getting daily puzzle when none exists."""
    response = client.get("/api/v1/puzzles/daily")
    assert response.status_code == 404

def test_get_puzzle_not_found(setup_db):
    """Test getting a puzzle that doesn't exist."""
    response = client.get("/api/v1/puzzles/nonexistent-id")
    assert response.status_code == 404

def test_submit_puzzle_attempt_puzzle_not_found(setup_db):
    """Test submitting an attempt for a non-existent puzzle."""
    attempt_data = {
        "is_daily": False,
        "moves_played": ["e2e4"],
        "status": "SUCCESS",
        "time_spent_ms": 5000,
        "hints_used": 0
    }
    response = client.post("/api/v1/puzzles/nonexistent-id/attempt", json=attempt_data)
    assert response.status_code == 404

def test_user_stats_new_user(setup_db):
    """Test getting stats for a new user."""
    response = client.get("/api/v1/puzzles/user/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["tactics_rating"] == 1200
    assert data["total_attempts"] == 0
    assert data["total_success"] == 0
    assert data["current_daily_streak"] == 0

def test_user_history_empty(setup_db):
    """Test getting history for a user with no attempts."""
    response = client.get("/api/v1/puzzles/user/history?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert data["history"] == []
    assert data["total"] == 0

def test_user_history_pagination(setup_db):
    """Test pagination of user history."""
    response = client.get("/api/v1/puzzles/user/history?limit=5&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["history"], list)