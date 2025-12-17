"""Fallback move generation for when engine fails."""

from __future__ import annotations
from typing import List
import random

try:
    import chess
    CHESS_AVAILABLE = True
except ImportError:
    # Try python-chess package name
    try:
        import chess
        CHESS_AVAILABLE = True
    except ImportError:
        CHESS_AVAILABLE = False


def generate_random_legal_move(fen: str) -> str:
    """Generate a random legal move from a position.

    Args:
        fen: FEN string of the position

    Returns:
        Move string in format "e2e4" (from_square + to_square)

    Raises:
        ValueError: If no legal moves available or chess library not available
    """
    if not CHESS_AVAILABLE:
        # If chess library not available, return a basic move
        # This is a fallback fallback - ideally chess library should be available
        raise ValueError("chess library not available for fallback move generation")

    try:
        board = chess.Board(fen)
        legal_moves = list(board.legal_moves)

        if not legal_moves:
            raise ValueError("No legal moves available")

        # Select random move
        move = random.choice(legal_moves)

        # Convert to UCI format (e.g., "e2e4")
        return move.uci()
    except (chess.InvalidFenError, ValueError) as e:
        raise ValueError(f"Failed to generate fallback move: {str(e)}")
