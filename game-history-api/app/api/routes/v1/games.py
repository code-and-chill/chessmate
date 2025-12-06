from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import get_repository
from app.core.models import GameCreate, GameSummary
from app.services.repository import GameHistoryRepository

router = APIRouter(tags=["game-history"])


@router.post("/games", response_model=GameSummary, status_code=201)
async def record_game(
    payload: GameCreate, repository: GameHistoryRepository = Depends(get_repository)
) -> GameSummary:
    summary = payload.to_summary()
    repository.add_game(summary)
    return summary


@router.get("/games/{game_id}", response_model=GameSummary)
async def get_game(
    game_id: UUID, repository: GameHistoryRepository = Depends(get_repository)
) -> GameSummary:
    game = repository.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/players/{player_id}/games", response_model=List[GameSummary])
async def list_player_games(
    player_id: UUID,
    limit: int = Query(default=20, ge=1, le=100),
    repository: GameHistoryRepository = Depends(get_repository),
) -> List[GameSummary]:
    return repository.list_games_for_player(player_id, limit=limit)
