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

def test_get_user_stats_new_user(setup_db):
    """Test getting stats for a new user."""
    response = client.get("/api/v1/puzzles/user/stats")
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["tactics_rating"] == 1200
    assert data["total_attempts"] == 0
    assert data["total_success"] == 0

def test_get_user_history_empty(setup_db):
    """Test getting history for user with no attempts."""
    response = client.get("/api/v1/puzzles/user/history?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert data["history"] == []
    assert data["total"] == 0

def test_get_user_history_invalid_limit(setup_db):
    """Test getting history with invalid limit."""
    response = client.get("/api/v1/puzzles/user/history?limit=1000&offset=0")
    assert response.status_code == 422  # Validation error

def test_get_user_history_valid_pagination(setup_db):
    """Test getting history with valid pagination params."""
    response = client.get("/api/v1/puzzles/user/history?limit=5&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["history"], list)
    assert data["total"] >= 0

def test_get_user_history_negative_offset(setup_db):
    """Test getting history with negative offset."""
    response = client.get("/api/v1/puzzles/user/history?limit=10&offset=-1")
    assert response.status_code == 422  # Validation error