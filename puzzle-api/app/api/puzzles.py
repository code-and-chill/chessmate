from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, date as date_type
from app.core.database import get_db
from app.core.schemas import PuzzleAttemptSubmission, PuzzleAttemptResponse
from app.infrastructure.repository import (
    DailyPuzzleRepository, PuzzleRepository, UserPuzzleAttemptRepository,
    UserPuzzleStatsRepository
)
from app.domain.services import PuzzleService
import uuid

router = APIRouter()

@router.get("/daily")
def get_daily_puzzle(
    date: str = Query(None),
    db: Session = Depends(get_db),
    user_id: str = "test-user-id"
):
    """
    Fetch the daily puzzle for the current or specified date.
    """
    puzzle_date = date or str(date_type.today())
    
    daily_puzzle = DailyPuzzleRepository.get_daily_puzzle_by_date(db, puzzle_date)
    if not daily_puzzle:
        raise HTTPException(status_code=404, detail="No puzzle for this date")
    
    puzzle = PuzzleRepository.get_puzzle_by_id(db, daily_puzzle.puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    
    attempt = UserPuzzleAttemptRepository.get_daily_attempt_for_user(
        db, user_id, puzzle.id, puzzle_date
    )
    
    stats = UserPuzzleStatsRepository.get_or_create_stats(db, user_id)
    
    user_state = {
        "has_attempted": attempt is not None,
        "status": attempt.status if attempt else "NONE",
        "best_time_ms": attempt.time_spent_ms if attempt else None,
        "attempt_id": attempt.id if attempt else None
    }
    
    return {
        "daily_puzzle": {
            "id": daily_puzzle.id,
            "puzzle_id": puzzle.id,
            "date_utc": puzzle_date,
            "title": daily_puzzle.global_title,
            "short_description": daily_puzzle.short_description,
            "puzzle": {
                "fen": puzzle.fen,
                "side_to_move": puzzle.side_to_move,
                "difficulty": puzzle.difficulty,
                "themes": puzzle.themes,
                "rating": puzzle.rating
            }
        },
        "user_state": user_state,
        "user_tactics_rating": stats.tactics_rating
    }

@router.get("/{puzzle_id}")
def get_puzzle(
    puzzle_id: str,
    db: Session = Depends(get_db)
):
    """
    Fetch full puzzle details.
    """
    puzzle = PuzzleRepository.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    
    return {
        "id": puzzle.id,
        "fen": puzzle.fen,
        "solution_moves": puzzle.solution_moves,
        "side_to_move": puzzle.side_to_move,
        "difficulty": puzzle.difficulty,
        "themes": puzzle.themes,
        "rating": puzzle.rating,
        "initial_depth": puzzle.initial_depth
    }

@router.post("/{puzzle_id}/attempt")
def submit_puzzle_attempt(
    puzzle_id: str,
    attempt: PuzzleAttemptSubmission,
    db: Session = Depends(get_db),
    user_id: str = "test-user-id"
):
    """
    Submit a puzzle attempt.
    """
    puzzle = PuzzleRepository.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    
    result = PuzzleService.process_attempt(
        db=db,
        user_id=user_id,
        puzzle_id=puzzle_id,
        attempt_data=attempt.dict(),
        puzzle_rating=puzzle.rating,
        is_daily=attempt.is_daily
    )
    
    attempt_obj = UserPuzzleAttemptRepository.create_attempt(
        db,
        attempt
    )
    
    return result