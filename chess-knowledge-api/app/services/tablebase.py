from __future__ import annotations
from typing import Optional
import chess

from app.domain.tablebase import TablebaseRequest, TablebaseResponse


async def query_tablebase(
    request: TablebaseRequest,
    cache: Optional[Any] = None,
) -> Optional[TablebaseResponse]:
    """
    Query endgame tablebase for a position.
    Returns None if position not in tablebase, or TablebaseResponse.
    
    Args:
        request: TablebaseRequest with FEN
        cache: Optional KnowledgeCache instance for caching results
    """
    # Check cache first if enabled
    if cache:
        cached_result = await cache.get_tablebase_result(request.fen)
        if cached_result is not None:
            return cached_result

    # Mock implementation: simple heuristic for common endgames
    board = chess.Board(request.fen)

    # Check if it's a simple endgame (few pieces)
    piece_count = len(board.piece_map())
    if piece_count > 7:
        return None  # Not in tablebase

    # Mock: find any legal move and return it as "best"
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None

    # Simple mock logic
    best_move = str(legal_moves[0])

    # Determine rough result (mock)
    result = "draw"
    dtm = None

    # Very basic heuristic: if we have more material, claim win
    white_material = sum(
        piece_type_value(p.piece_type)
        for p in board.piece_map().values()
        if p.color == chess.WHITE
    )
    black_material = sum(
        piece_type_value(p.piece_type)
        for p in board.piece_map().values()
        if p.color == chess.BLACK
    )

    material_diff = white_material - black_material
    if board.turn == chess.WHITE:
        if material_diff > 3:
            result = "win"
            dtm = 15
        elif material_diff < -3:
            result = "loss"
            dtm = 15
    else:
        if material_diff < -3:
            result = "win"
            dtm = 15
        elif material_diff > 3:
            result = "loss"
            dtm = 15

    tablebase_result = TablebaseResponse(best_move=best_move, result=result, dtm=dtm)

    # Cache result if caching enabled
    if cache:
        await cache.set_tablebase_result(request.fen, tablebase_result)

    return tablebase_result


def piece_type_value(piece_type: int) -> int:
    """Simple piece values for mock logic."""
    values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9,
        chess.KING: 0,
    }
    return values.get(piece_type, 0)
