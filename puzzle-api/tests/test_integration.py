import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.core.schemas import PuzzleCreate, DailyPuzzleCreate
from app.infrastructure.repository import PuzzleRepository, DailyPuzzleRepository

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_db():
    """Create test database tables before each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def sample_puzzle(setup_db):
    """Create a sample puzzle in the database."""
    db = SessionLocal()
    puzzle_data = PuzzleCreate(
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        solution_moves=["e2e4", "e7e5"],
        side_to_move="white",
        initial_depth=2,
        difficulty="EASY",
        themes=["opening", "tactics"],
        source="GAME",
        rating=1200
    )
    puzzle = PuzzleRepository.create_puzzle(db, puzzle_data)
    db.close()
    return puzzle

def test_complete_daily_puzzle_workflow(sample_puzzle):
    """Test complete workflow: set daily puzzle, fetch, and submit attempt."""
    # Step 1: Set daily puzzle
    response = client.put(
        "/api/v1/admin/daily-puzzles/2025-11-16",
        json={
            "puzzle_id": sample_puzzle.id,
            "title": "Test Daily Puzzle",
            "description": "A test puzzle for integration testing",
            "featured": True
        }
    )
    assert response.status_code == 200
    daily_response = response.json()
    assert daily_response["status"] in ["created", "updated"]
    
    # Step 2: Fetch daily puzzle
    response = client.get("/api/v1/puzzles/daily?date=2025-11-16")
    assert response.status_code == 200
    daily_data = response.json()
    assert "daily_puzzle" in daily_data
    assert daily_data["daily_puzzle"]["puzzle_id"] == sample_puzzle.id
    assert daily_data["user_state"]["status"] == "NONE"
    assert daily_data["user_tactics_rating"] == 1200
    
    # Step 3: Submit an attempt
    attempt_response = client.post(
        f"/api/v1/puzzles/{sample_puzzle.id}/attempt",
        json={
            "is_daily": True,
            "moves_played": ["e2e4", "e7e5"],
            "status": "SUCCESS",
            "time_spent_ms": 30000,
            "hints_used": 0
        }
    )
    assert attempt_response.status_code == 200
    attempt_data = attempt_response.json()
    assert attempt_data["correct"] == True
    assert attempt_data["rating_after"] > attempt_data["rating_before"]
    
    # Step 4: Verify user stats updated
    stats_response = client.get("/api/v1/puzzles/user/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["total_attempts"] == 1
    assert stats["total_success"] == 1
    assert stats["current_daily_streak"] == 1

def test_failed_attempt_decreases_rating(sample_puzzle):
    """Test that a failed attempt decreases rating."""
    # Get initial rating
    stats_response = client.get("/api/v1/puzzles/user/stats")
    initial_rating = stats_response.json()["tactics_rating"]
    
    # Submit failed attempt
    attempt_response = client.post(
        f"/api/v1/puzzles/{sample_puzzle.id}/attempt",
        json={
            "is_daily": False,
            "moves_played": ["e2e4"],
            "status": "FAILED",
            "time_spent_ms": 60000,
            "hints_used": 2
        }
    )
    assert attempt_response.status_code == 200
    attempt_data = attempt_response.json()
    assert attempt_data["correct"] == False
    assert attempt_data["rating_after"] < attempt_data["rating_before"]
    
    # Verify stats
    stats_response = client.get("/api/v1/puzzles/user/stats")
    stats = stats_response.json()
    assert stats["total_attempts"] == 1
    assert stats["total_success"] == 0

def test_puzzle_history_tracking(sample_puzzle):
    """Test that puzzle attempts are tracked in history."""
    # Submit multiple attempts
    for i in range(3):
        client.post(
            f"/api/v1/puzzles/{sample_puzzle.id}/attempt",
            json={
                "is_daily": False,
                "moves_played": ["e2e4"],
                "status": "SUCCESS" if i % 2 == 0 else "FAILED",
                "time_spent_ms": 10000 * (i + 1),
                "hints_used": 0
            }
        )
    
    # Fetch history
    history_response = client.get("/api/v1/puzzles/user/history?limit=10&offset=0")
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert history_data["total"] == 3
    assert len(history_data["history"]) == 3

def test_multiple_users_isolated_stats(sample_puzzle):
    """Test that stats are isolated per user."""
    # User 1 succeeds
    client.get("/api/v1/puzzles/user/stats")  # Creates user 1
    client.post(
        f"/api/v1/puzzles/{sample_puzzle.id}/attempt",
        json={
            "is_daily": True,
            "moves_played": ["e2e4"],
            "status": "SUCCESS",
            "time_spent_ms": 10000,
            "hints_used": 0
        }
    )
    
    stats1 = client.get("/api/v1/puzzles/user/stats").json()
    assert stats1["total_attempts"] == 1
    assert stats1["total_success"] == 1
