"""Opening book response DTO."""
from typing import List

from pydantic import BaseModel

from .book_move import BookMove


class OpeningBookResponse(BaseModel):
    """Response from opening book query."""

    moves: List[BookMove]
    fen: str
