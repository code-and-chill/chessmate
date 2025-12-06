from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TimeControlBucket(str, Enum):
    BULLET = "BULLET"
    BLITZ = "BLITZ"
    RAPID = "RAPID"
    CLASSICAL = "CLASSICAL"
    PUZZLE = "PUZZLE"


class Mode(str, Enum):
    RATED = "RATED"
    CASUAL = "CASUAL"
    BOT = "BOT"


class StreakType(str, Enum):
    WIN = "WIN"
    LOSS = "LOSS"
    NONE = "NONE"


class Streak(BaseModel):
    type: StreakType
    length: int = Field(ge=0)


class PlayerTimeControlStats(BaseModel):
    timeControlBucket: TimeControlBucket
    gamesPlayed: int
    wins: int
    losses: int
    draws: int
    aborts: int
    winrate: float
    lastGameAt: Optional[datetime] = None
    currentStreak: Optional[Streak] = None
    bestWinStreak: int = 0
    bestLossStreak: int = 0
    avgMoves: Optional[float] = None
    currentRating: Optional[int] = None


class PlayerSummary(BaseModel):
    totalGames: int
    totalWins: int
    totalLosses: int
    totalDraws: int
    winrate: float
    currentGlobalStreak: Optional[Streak] = None


class RecentWindowSummary(BaseModel):
    window: str
    since: datetime
    until: datetime
    gamesPlayed: int
    wins: int
    losses: int
    draws: int
    winrate: float


class PlayerOverviewResponse(BaseModel):
    playerId: str
    generatedAt: datetime
    summary: PlayerSummary
    byTimeControl: List[PlayerTimeControlStats]
    recentWindow: Optional[RecentWindowSummary] = None


class ColorBreakdown(BaseModel):
    gamesPlayed: int
    wins: int
    losses: int
    draws: int
    winrate: float


class PerformanceResponse(BaseModel):
    playerId: str
    timeControlBucket: Optional[TimeControlBucket]
    window: str
    since: datetime
    until: datetime
    gamesPlayed: int
    wins: int
    losses: int
    draws: int
    winrate: float
    byColor: Dict[str, ColorBreakdown]
    streaks: Dict[str, Streak]


class RatingPoint(BaseModel):
    timestamp: datetime
    rating: int


class RatingTrendResponse(BaseModel):
    playerId: str
    timeControlBucket: TimeControlBucket
    from_: Optional[datetime] = Field(None, alias="from")
    to: Optional[datetime] = None
    points: List[RatingPoint]


class RecentResult(BaseModel):
    gameId: str
    endedAt: datetime
    result: str


class RecentFormSummary(BaseModel):
    wins: int
    losses: int
    draws: int
    winrate: float
    currentStreak: Optional[Streak] = None


class RecentFormResponse(BaseModel):
    playerId: str
    timeControlBucket: Optional[TimeControlBucket]
    limit: int
    results: List[RecentResult]
    summary: RecentFormSummary


class HealthResponse(BaseModel):
    status: str
    postgres: str
    kafka: str
    processedThrough: datetime
