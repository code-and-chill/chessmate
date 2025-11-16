"""Social counters response DTO."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SocialCountersResponse(BaseModel):
    """Social counters response model."""

    followers_count: int
    following_count: int
    friends_count: int
    clubs_count: int
    total_games_played: int
    total_puzzles_solved: int
    last_game_at: Optional[datetime] = None
    last_puzzle_at: Optional[datetime] = None

    class Config:
        from_attributes = True
