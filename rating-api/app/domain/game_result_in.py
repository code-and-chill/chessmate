"""Game result input model."""
from datetime import datetime

from pydantic import BaseModel


class GameResultIn(BaseModel):
    game_id: str
    pool_id: str
    white_user_id: str
    black_user_id: str
    result: str  # white_win | black_win | draw
    rated: bool = True
    ended_at: datetime
