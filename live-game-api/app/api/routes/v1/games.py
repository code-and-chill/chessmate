"""Games API routes."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_game_service
from app.api.models import (
    CreateGameRequest,
    GameResponse,
    GameSummaryResponse,
    JoinGameRequest,
    PlayMoveRequest,
)
from app.core.exceptions import (
    ApplicationException,
    GameNotFoundError,
    GameStateError,
    InvalidMoveError,
    NotPlayersTurnError,
)
from app.domain.models.game import TimeControl
from app.domain.services.game_service import GameService

router = APIRouter()


@router.post("/games", response_model=GameSummaryResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    request: CreateGameRequest,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Create a new game challenge."""
    try:
        time_control = TimeControl(
            initial_seconds=request.time_control.initial_seconds,
            increment_seconds=request.time_control.increment_seconds,
        )

        game = await game_service.create_challenge(
            creator_id=current_user,
            time_control=time_control,
            opponent_account_id=request.opponent_account_id,
            color_preference=request.color_preference,
            rated=request.rated,
        )

        return GameSummaryResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            result=game.result,
            end_reason=game.end_reason,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
        )
    except ApplicationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/games/{game_id}", response_model=GameResponse)
async def get_game(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Get current state of a game."""
    try:
        game = await game_service.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            white_remaining_ms=game.white_clock_ms,
            black_remaining_ms=game.black_clock_ms,
            side_to_move=game.side_to_move,
            fen=game.fen,
            moves=[
                {
                    "ply": m.ply,
                    "move_number": m.move_number,
                    "color": m.color,
                    "from_square": m.from_square,
                    "to_square": m.to_square,
                    "promotion": m.promotion,
                    "san": m.san,
                    "played_at": m.played_at,
                    "elapsed_ms": m.elapsed_ms,
                }
                for m in game.moves
            ],
            result=game.result,
            end_reason=game.end_reason,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
        )
    except ApplicationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/games/{game_id}/join", response_model=GameResponse)
async def join_game(
    game_id: UUID,
    request: JoinGameRequest,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Join an existing game challenge."""
    try:
        game = await game_service.join_game(
            game_id=game_id,
            opponent_id=current_user,
            color_preference=request.color_preference,
        )

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            white_remaining_ms=game.white_clock_ms,
            black_remaining_ms=game.black_clock_ms,
            side_to_move=game.side_to_move,
            fen=game.fen,
            moves=[
                {
                    "ply": m.ply,
                    "move_number": m.move_number,
                    "color": m.color,
                    "from_square": m.from_square,
                    "to_square": m.to_square,
                    "promotion": m.promotion,
                    "san": m.san,
                    "played_at": m.played_at,
                    "elapsed_ms": m.elapsed_ms,
                }
                for m in game.moves
            ],
            result=game.result,
            end_reason=game.end_reason,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
        )
    except ApplicationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/games/{game_id}/moves", response_model=GameResponse)
async def play_move(
    game_id: UUID,
    request: PlayMoveRequest,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Play a move in an active game."""
    try:
        game = await game_service.play_move(
            game_id=game_id,
            player_id=current_user,
            from_square=request.from_square,
            to_square=request.to_square,
            promotion=request.promotion,
        )

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            white_remaining_ms=game.white_clock_ms,
            black_remaining_ms=game.black_clock_ms,
            side_to_move=game.side_to_move,
            fen=game.fen,
            moves=[
                {
                    "ply": m.ply,
                    "move_number": m.move_number,
                    "color": m.color,
                    "from_square": m.from_square,
                    "to_square": m.to_square,
                    "promotion": m.promotion,
                    "san": m.san,
                    "played_at": m.played_at,
                    "elapsed_ms": m.elapsed_ms,
                }
                for m in game.moves
            ],
            result=game.result,
            end_reason=game.end_reason,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
        )
    except ApplicationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/games/{game_id}/resign", response_model=GameResponse)
async def resign(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Player resigns from the game."""
    try:
        game = await game_service.resign(game_id=game_id, player_id=current_user)

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            white_remaining_ms=game.white_clock_ms,
            black_remaining_ms=game.black_clock_ms,
            side_to_move=game.side_to_move,
            fen=game.fen,
            moves=[
                {
                    "ply": m.ply,
                    "move_number": m.move_number,
                    "color": m.color,
                    "from_square": m.from_square,
                    "to_square": m.to_square,
                    "promotion": m.promotion,
                    "san": m.san,
                    "played_at": m.played_at,
                    "elapsed_ms": m.elapsed_ms,
                }
                for m in game.moves
            ],
            result=game.result,
            end_reason=game.end_reason,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
        )
    except ApplicationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
