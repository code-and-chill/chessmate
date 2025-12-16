from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from datetime import date as date_type
from app.core.database import get_db
from app.core.schemas import PuzzleAttemptSubmission
from app.infrastructure.repository import (
    DailyPuzzleRepository, PuzzleRepository, UserPuzzleAttemptRepository,
    UserPuzzleStatsRepository
)
from app.domain.services import PuzzleService
from app.infrastructure.redis_rate_limiter import get_default_limiter

router = APIRouter()

@router.get("/daily")
def get_daily_puzzle(
    date: str = Query(None),
    db: Session = Depends(get_db),
    user_id: str = "test-user-id"
):
    puzzle_date = date or str(date_type.today())

    daily_puzzle = DailyPuzzleRepository.get_daily_puzzle_by_date(db, puzzle_date)
    if not daily_puzzle:
        raise HTTPException(status_code=404, detail="No puzzle for this date")

    puzzle = PuzzleRepository.get_puzzle_by_id(db, daily_puzzle.puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    attempt = UserPuzzleAttemptRepository.get_daily_attempt_for_user(db, user_id, puzzle.id, puzzle_date)
    stats = UserPuzzleStatsRepository.get_or_create_stats(db, user_id)

    user_state = {
        "has_attempted": attempt is not None,
        "status": attempt.status if attempt else "NONE",
        "best_time_ms": attempt.time_spent_ms if attempt else None,
        "attempt_id": attempt.id if attempt else None
    }

    followups = []
    try:
        sol = puzzle.solution_moves or []
    except Exception:
        sol = []
    for i in range(min(3, len(sol))):
        followups.append(sol[: i + 1 ])

    limiter = get_default_limiter()
    rate = limiter.check(user_id)

    return {
        "daily_puzzle": {
            "id": daily_puzzle.id,
            "puzzle_id": puzzle.id,
            "date_utc": puzzle_date,
            "title": daily_puzzle.global_title,
            "short_description": daily_puzzle.short_description,
            "problem": {
                "fen": puzzle.fen,
                "side_to_move": puzzle.side_to_move,
                "difficulty": puzzle.difficulty,
                "themes": puzzle.themes,
                "rating": puzzle.rating,
                "followups": followups,
                "infinite": True,
                "show_player_section": False
            }
        },
        "user_state": user_state,
        "user_tactics_rating": stats.tactics_rating,
        "rate_limit": rate
    }

@router.get("/{puzzle_id}")
def get_puzzle(
    puzzle_id: str,
    db: Session = Depends(get_db)
):
    puzzle = PuzzleRepository.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    sol = getattr(puzzle, 'solution_moves', []) or []
    followups = []
    for i in range(min(3, len(sol))):
        followups.append(sol[: i + 1 ])

    limiter = get_default_limiter()
    rate = limiter.check("anonymous")

    return {
        "id": puzzle.id,
        "problem": {
            "fen": puzzle.fen,
            "side_to_move": puzzle.side_to_move,
            "difficulty": puzzle.difficulty,
            "themes": puzzle.themes,
            "rating": puzzle.rating,
            "followups": followups,
            "infinite": True,
            "show_player_section": False
        },
        "initial_depth": puzzle.initial_depth,
        "rate_limit": rate
    }

@router.post("/{puzzle_id}/attempt")
def submit_puzzle_attempt(
    puzzle_id: str,
    attempt: PuzzleAttemptSubmission,
    db: Session = Depends(get_db),
    user_id: str = "test-user-id"
):
    # Check rate limit first (fail fast)
    limiter = get_default_limiter()
    rate = limiter.check(user_id)
    if rate["remaining"] <= 0:
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded", 
            headers={"Retry-After": str(rate["reset_seconds"])}
        )

    # Validate puzzle exists
    puzzle = PuzzleRepository.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    # Record the rate limit usage and get updated rate info
    limiter.record(user_id)
    updated_rate = limiter.check(user_id)

    # Process the attempt
    result = PuzzleService.process_attempt(
        db=db, 
        user_id=user_id, 
        puzzle_id=puzzle_id, 
        attempt_data=attempt.dict(), 
        puzzle_rating=puzzle.rating, 
        is_daily=attempt.is_daily
    )

    # Create attempt record (don't fail the request if this fails)
    attempt_id = None
    try:
        attempt_obj = UserPuzzleAttemptRepository.create_attempt(db, attempt)
        attempt_id = attempt_obj.id
    except Exception:
        pass  # Log this in production

    # Generate guidance for incorrect attempts
    correct = result.get('correct', False) if isinstance(result, dict) else getattr(result, 'correct', False)
    guidance = None
    if not correct:
        sol = puzzle.solution_moves or []
        if sol:
            guidance = sol[:min(3, len(sol))]

    return {
        "result": result,
        "attempt_id": attempt_id,
        "guidance": guidance,
        "rate_limit": updated_rate  # Use cached rate instead of re-checking
    }
