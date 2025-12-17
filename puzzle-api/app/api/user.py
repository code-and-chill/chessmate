from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_puzzle_cache
from app.infrastructure.repository import (
    UserPuzzleStatsRepository, UserPuzzleAttemptRepository,
    PuzzleRepository
)

router = APIRouter()

@router.get("/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    user_id: str = "test-user-id"
):
    """
    Retrieve user puzzle statistics.
    """
    stats = UserPuzzleStatsRepository.get_or_create_stats(db, user_id)
    
    return {
        "user_id": user_id,
        "tactics_rating": stats.tactics_rating,
        "tactics_rd": stats.tactics_rd,
        "total_attempts": stats.total_attempts,
        "total_success": stats.total_success,
        "current_daily_streak": stats.current_daily_streak,
        "longest_daily_streak": stats.longest_daily_streak,
        "last_daily_solved_date": stats.last_daily_solved_date
    }

@router.get("/history")
async def get_user_history(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user_id: str = "test-user-id",
    cache = Depends(get_puzzle_cache),
):
    """
    Fetch the user's recent puzzle attempts.
    """
    # Check cache first (only if offset is 0, as cache stores first page)
    if cache and offset == 0:
        cached_result = await cache.get_puzzle_feed(user_id)
        if cached_result:
            return cached_result
    
    attempts = UserPuzzleAttemptRepository.get_user_attempts(db, user_id, limit, offset)
    
    history = []
    for attempt in attempts:
        puzzle = PuzzleRepository.get_puzzle_by_id(db, attempt.puzzle_id)
        history.append({
            "attempt_id": attempt.id,
            "puzzle_id": attempt.puzzle_id,
            "date": attempt.started_at.isoformat(),
            "status": attempt.status,
            "time_spent_ms": attempt.time_spent_ms,
            "rating_change": attempt.rating_change,
            "puzzle_rating": puzzle.rating if puzzle else None
        })
    
    result = {"history": history, "total": len(history)}
    
    # Cache result (only first page)
    if cache and offset == 0:
        await cache.set_puzzle_feed(user_id, result)
    
    return result