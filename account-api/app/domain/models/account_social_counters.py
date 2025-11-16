"""Account social counters domain model."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AccountSocialCounters(BaseModel):
    """Account social counters domain model (denormalized)."""
    model_config = ConfigDict(from_attributes=True)

    account_id: UUID
    followers_count: int = 0
    following_count: int = 0
    friends_count: int = 0
    clubs_count: int = 0
    total_games_played: int = 0
    total_puzzles_solved: int = 0
    last_game_at: Optional[datetime] = None
    last_puzzle_at: Optional[datetime] = None
    updated_at: datetime
