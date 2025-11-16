"""Game result output model."""
from pydantic import BaseModel


class GameResultOut(BaseModel):
    game_id: str
    white_rating_after: float
    black_rating_after: float
