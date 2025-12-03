"""Additional enforcement endpoints for games API."""

# Add these endpoints to live-game-api/app/api/routes/v1/games.py


@router.post("/games/{game_id}/takeback", response_model=GameResponse)
async def request_takeback(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Request to undo the last move.
    
    Enforcement Rules:
    - Rated games: Takebacks are NOT allowed (403 Forbidden)
    - Unrated games: Takebacks are allowed
    """
    try:
        game = await game_service.request_takeback(
            game_id=game_id, player_id=current_user
        )

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
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


@router.post("/games/{game_id}/position", response_model=GameResponse)
async def set_position(
    game_id: UUID,
    fen: str,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Set a custom board position (only before game starts).
    
    Enforcement Rules:
    - Rated games: Board edits are NOT allowed (403 Forbidden)
    - Unrated games: Board edits allowed only before game starts
    """
    try:
        game = await game_service.set_position(
            game_id=game_id, player_id=current_user, fen=fen
        )

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
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


@router.patch("/games/{game_id}/rated", response_model=GameResponse)
async def update_rated_status(
    game_id: UUID,
    rated: bool,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    """Update the rated status of a game (only before game starts).
    
    Enforcement Rules:
    - Can only be changed before the game starts
    - Will be re-validated by RatingDecisionEngine
    """
    try:
        game = await game_service.update_rated_status(
            game_id=game_id, player_id=current_user, rated=rated
        )

        return GameResponse(
            id=game.id,
            status=game.status,
            rated=game.rated,
            decision_reason=game.decision_reason,
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
