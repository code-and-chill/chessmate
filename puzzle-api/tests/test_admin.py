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

def test_import_puzzles_invalid_data(setup_db):
    """Test importing puzzles with invalid data."""
    puzzles = [{"invalid": "data"}]
    response = client.post("/api/v1/admin/puzzles/import", json=puzzles)
    assert response.status_code == 400

def test_import_puzzles_empty_list(setup_db):
    """Test importing an empty list of puzzles."""
    puzzles = []
    response = client.post("/api/v1/admin/puzzles/import", json=puzzles)
    assert response.status_code == 200
    data = response.json()
    assert data["imported_count"] == 0

def test_set_daily_puzzle_not_found(setup_db):
    """Test setting daily puzzle with non-existent puzzle."""
    response = client.put(
        "/api/v1/admin/daily-puzzles/2025-11-16",
        json={
            "puzzle_id": "nonexistent",
            "title": "Test",
            "description": "Test"
        }
    )
    assert response.status_code == 404

def test_update_puzzle_tags_not_found(setup_db):
    """Test updating tags for a non-existent puzzle."""
    response = client.post(
        "/api/v1/admin/puzzles/nonexistent/tags",
        json={"themes": ["test"]}
    )
    assert response.status_code == 404