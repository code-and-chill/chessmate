"""Rating snapshot model."""
from datetime import datetime

from pydantic import BaseModel, Field


class RatingSnapshot(BaseModel):
    pool_id: str = Field(..., description="Pool code, e.g., blitz_standard")
    rating: float
    rating_deviation: float
    volatility: float
    games_played: int
    provisional: bool
    last_updated_at: datetime
