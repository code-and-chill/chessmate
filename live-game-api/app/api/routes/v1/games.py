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
from app.api.bot_game_request import CreateBotGameRequest
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
    """Create a new game challenge.
    
    The rated status may be automatically overridden based on game configuration:
    - Local games are always unrated
    - Custom starting positions force unrated
    - Odds/handicap games force unrated
    - Large rating gaps force unrated
    
    The response includes the authoritative rated status and decision_reason.
    """
    try:
        time_control = TimeControl(
            initial_seconds=request.time_control.initial_seconds,
            increment_seconds=request.time_control.increment_seconds,
        )

        # TODO: Fetch player ratings from rating-api for rating gap check
        # For now, we pass None which skips the rating gap check
        game = await game_service.create_challenge(
            creator_id=current_user,
            time_control=time_control,
            opponent_account_id=request.opponent_account_id,
            color_preference=request.color_preference,
            rated=request.rated,
            is_local_game=request.is_local_game,
            starting_fen=request.starting_fen,
            is_odds_game=request.is_odds_game,
            creator_rating=None,  # TODO: Fetch from rating-api
            opponent_rating=None,  # TODO: Fetch from rating-api
        )

        return GameSummaryResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
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


@router.post("/games/bot", response_model=GameSummaryResponse, status_code=status.HTTP_201_CREATED)
async def create_bot_game(
    request: CreateBotGameRequest,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Create a new bot game.
    
    Bot games are always unrated and start immediately.
    The bot difficulty determines the bot's strength (beginner to master).
    """
    try:
        time_control = TimeControl(
            initial_seconds=request.time_control.initial_seconds,
            increment_seconds=request.time_control.increment_seconds,
        )

        game = await game_service.create_bot_game(
            creator_id=current_user,
            difficulty=request.difficulty,
            player_color=request.player_color,
            time_control=time_control,
        )

        return GameSummaryResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
            result=game.result,
            end_reason=game.end_reason,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
        )
    except ApplicationException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/games/{game_id}/takeback", response_model=GameResponse)
async def request_takeback(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Request a takeback. Allowed only for unrated games.

    Rated games will receive 403 via domain exception mapping.
    """
    try:
        game = await game_service.request_takeback(game_id=game_id, player_id=current_user)
        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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


@router.post("/games/{game_id}/position", response_model=GameResponse)
async def set_position(
    game_id: UUID,
    body: dict,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Set a custom board position (FEN). Allowed only before start in unrated games."""
    fen = body.get("fen")
    if not fen:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Missing 'fen' in request body")
    try:
        game = await game_service.set_position(game_id=game_id, player_id=current_user, fen=fen)
        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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


@router.patch("/games/{game_id}/rated", response_model=GameResponse)
async def update_rated_status(
    game_id: UUID,
    body: dict,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Update the rated flag before the game starts.

    Domain will enforce immutability once started and may auto-override.
    """
    if "rated" not in body:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Missing 'rated' in request body")
    try:
        game = await game_service.update_rated_status(game_id=game_id, player_id=current_user, rated=bool(body["rated"]))
        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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
            decision_reason=game.decision_reason,
            variant_code=game.variant_code,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
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
