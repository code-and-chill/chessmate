from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class OpeningBookRequest(BaseModel):
    fen: str = Field(..., description="Position in FEN notation")
    repertoire: Optional[str] = Field(default=None, description="Specific opening repertoire to use")


class BookMove(BaseModel):
    move: str = Field(..., description="Move in UCI notation")
    weight: float = Field(..., description="Weight/popularity of this move (0.0-1.0)")
    games: Optional[int] = Field(default=None, description="Number of games with this move")
    win_rate: Optional[float] = Field(default=None, description="Win rate for this move")


class OpeningBookResponse(BaseModel):
    moves: List[BookMove]
    fen: str


class TablebaseRequest(BaseModel):
    fen: str = Field(..., description="Position in FEN notation")


class TablebaseResponse(BaseModel):
    best_move: str = Field(..., description="Best move in UCI notation")
    result: str = Field(..., description="Game result: win/draw/loss from side-to-move perspective")
    dtm: Optional[int] = Field(default=None, description="Distance to mate (moves)")
