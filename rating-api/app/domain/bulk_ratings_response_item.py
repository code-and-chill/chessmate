"""Bulk ratings response item model."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BulkRatingsResponseItem(BaseModel):
    user_id: str
    rating: Optional[float] = None
    rating_deviation: Optional[float] = None
    volatility: Optional[float] = None
    games_played: Optional[int] = None
    provisional: Optional[bool] = None
    last_updated_at: Optional[datetime] = None
