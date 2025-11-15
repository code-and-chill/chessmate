from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RatingSnapshot(BaseModel):
    pool_id: str = Field(..., description="Pool code, e.g., blitz_standard")
    rating: float
    rating_deviation: float
    volatility: float
    games_played: int
    provisional: bool
    last_updated_at: datetime


class UserRatingsResponse(BaseModel):
    user_id: str
    ratings: List[RatingSnapshot]


class BulkRatingsRequest(BaseModel):
    pool_id: str
    user_ids: List[str]


class BulkRatingsResponseItem(BaseModel):
    user_id: str
    rating: Optional[float] = None
    rating_deviation: Optional[float] = None
    volatility: Optional[float] = None
    games_played: Optional[int] = None
    provisional: Optional[bool] = None
    last_updated_at: Optional[datetime] = None


class BulkRatingsResponse(BaseModel):
    pool_id: str
    results: List[BulkRatingsResponseItem]


class GameResultIn(BaseModel):
    game_id: str
    pool_id: str
    white_user_id: str
    black_user_id: str
    result: str  # white_win | black_win | draw
    rated: bool = True
    ended_at: datetime


class GameResultOut(BaseModel):
    game_id: str
    white_rating_after: float
    black_rating_after: float
