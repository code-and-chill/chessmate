from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

class DifficultyEnum(str, Enum):
    BEGINNER = "BEGINNER"
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    MASTER = "MASTER"

class StatusEnum(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    ABANDONED = "ABANDONED"

class SourceEnum(str, Enum):
    GAME = "GAME"
    COMPOSED = "COMPOSED"
    ENGINE_GENERATED = "ENGINE_GENERATED"

class PuzzleBase(BaseModel):
    fen: str
    solution_moves: List[str]
    side_to_move: str
    initial_depth: int
    difficulty: DifficultyEnum
    themes: List[str]
    source: SourceEnum
    rating: int

class PuzzleCreate(PuzzleBase):
    pass

class PuzzleResponse(PuzzleBase):
    id: str
    popularity_score: Optional[float] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DailyPuzzleBase(BaseModel):
    puzzle_id: str
    date_utc: str
    global_title: str
    short_description: str
    featured: bool = False

class DailyPuzzleCreate(DailyPuzzleBase):
    created_by_admin_id: str

class DailyPuzzleResponse(DailyPuzzleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserPuzzleAttemptBase(BaseModel):
    user_id: str
    puzzle_id: str
    attempt_id: Optional[str] = None  # Client-generated UUID for idempotency
    is_daily: bool
    status: StatusEnum
    moves_played: List[str]
    mistakes: int = 0
    hints_used: int = 0
    time_spent_ms: int

class UserPuzzleAttemptCreate(UserPuzzleAttemptBase):
    client_metadata: Optional[dict] = None

class UserPuzzleAttemptResponse(UserPuzzleAttemptBase):
    id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    rating_change: Optional[int] = None

    class Config:
        from_attributes = True

class UserPuzzleStatsResponse(BaseModel):
    user_id: str
    tactics_rating: int
    tactics_rd: Optional[float] = None
    total_attempts: int
    total_success: int
    current_daily_streak: int
    longest_daily_streak: int
    last_daily_solved_date: Optional[str] = None

    class Config:
        from_attributes = True

class PuzzleAttemptSubmission(BaseModel):
    attempt_id: Optional[str] = None  # Client-generated UUID for idempotency
    is_daily: bool
    moves_played: List[str]
    status: StatusEnum
    time_spent_ms: int
    hints_used: int = 0
    client_metadata: Optional[dict] = None

class PuzzleAttemptResponse(BaseModel):
    attempt_id: str
    status: str
    correct: bool
    rating_before: int
    rating_after: int
    rating_change: int
    updated_stats: UserPuzzleStatsResponse

class DailyPuzzleResponse(BaseModel):
    daily_puzzle: dict
    user_state: dict
    user_tactics_rating: int
