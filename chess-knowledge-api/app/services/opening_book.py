from __future__ import annotations
from typing import List, Optional
import chess

from app.domain.models import BookMove, OpeningBookRequest


async def query_opening_book(request: OpeningBookRequest) -> Optional[List[BookMove]]:
    """
    Query opening book for a position.
    Returns None if position not in book, or list of BookMove.
    """
    # Mock implementation: return popular opening moves for starting position
    board = chess.Board(request.fen)

    # Simple heuristic: if position is in first 10 plies, return popular moves
    if board.fullmove_number > 5:
        return None

    # Mock data for starting position and common responses
    mock_books = {
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": [
            BookMove(move="e2e4", weight=0.35, games=5000, win_rate=0.52),
            BookMove(move="d2d4", weight=0.30, games=4500, win_rate=0.51),
            BookMove(move="g1f3", weight=0.20, games=3000, win_rate=0.50),
            BookMove(move="c2c4", weight=0.15, games=2000, win_rate=0.49),
        ],
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": [
            BookMove(move="c7c5", weight=0.30, games=3000, win_rate=0.48),
            BookMove(move="e7e5", weight=0.25, games=2500, win_rate=0.47),
            BookMove(move="e7e6", weight=0.20, games=2000, win_rate=0.46),
            BookMove(move="c7c6", weight=0.15, games=1500, win_rate=0.45),
        ],
    }

    fen_key = request.fen
    if fen_key in mock_books:
        return mock_books[fen_key]

    # Generate mock moves for any other position in opening phase
    legal_moves = list(board.legal_moves)[:4]
    if legal_moves:
        return [
            BookMove(
                move=str(move),
                weight=0.5 - (i * 0.1),
                games=1000 - (i * 200),
                win_rate=0.50 - (i * 0.02),
            )
            for i, move in enumerate(legal_moves)
        ]

    return None
