from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.schemas import PuzzleCreate, DailyPuzzleCreate
from app.infrastructure.repository import (
    PuzzleRepository, DailyPuzzleRepository
)
import uuid

router = APIRouter()

@router.post("/puzzles/import")
def import_puzzles(
    puzzles: list,
    db: Session = Depends(get_db)
):
    """
    Import puzzles in bulk.
    """
    imported = []
    for puzzle_data in puzzles:
        try:
            puzzle = PuzzleCreate(**puzzle_data)
            created = PuzzleRepository.create_puzzle(db, puzzle)
            imported.append(created.id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error importing puzzle: {str(e)}")
    
    return {"status": "success", "imported_count": len(imported), "puzzle_ids": imported}

@router.put("/daily-puzzles/{date_utc}")
def set_daily_puzzle(
    date_utc: str,
    puzzle_id: str,
    title: str,
    description: str = "",
    featured: bool = False,
    admin_id: str = "admin-user-id",
    db: Session = Depends(get_db)
):
    """
    Set or override the daily puzzle for a specific date.
    """
    puzzle = PuzzleRepository.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    
    existing = DailyPuzzleRepository.get_daily_puzzle_by_date(db, date_utc)
    
    if existing:
        updated = DailyPuzzleRepository.update_daily_puzzle(db, date_utc, puzzle_id, title)
        return {"status": "updated", "date": date_utc, "puzzle_id": puzzle_id}
    else:
        daily = DailyPuzzleCreate(
            puzzle_id=puzzle_id,
            date_utc=date_utc,
            global_title=title,
            short_description=description,
            featured=featured,
            created_by_admin_id=admin_id
        )
        created = DailyPuzzleRepository.create_daily_puzzle(db, daily)
        return {"status": "created", "date": date_utc, "puzzle_id": puzzle_id, "id": created.id}

@router.post("/puzzles/{puzzle_id}/tags")
def update_puzzle_tags(
    puzzle_id: str,
    themes: list = [],
    difficulty: str = None,
    rating: int = None,
    is_active: bool = None,
    db: Session = Depends(get_db)
):
    """
    Update puzzle metadata.
    """
    puzzle = PuzzleRepository.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    
    if themes:
        puzzle.themes = themes
    if difficulty:
        puzzle.difficulty = difficulty
    if rating is not None:
        puzzle.rating = rating
    if is_active is not None:
        puzzle.is_active = is_active
    
    db.commit()
    db.refresh(puzzle)
    
    return {"status": "success", "puzzle_id": puzzle_id}