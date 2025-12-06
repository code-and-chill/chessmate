from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class GameResult(str, Enum):
    WHITE_WIN = "WHITE_WIN"
    BLACK_WIN = "BLACK_WIN"
    DRAW = "DRAW"
    ABORTED = "ABORTED"


class GameMode(str, Enum):
    RATED = "RATED"
    CASUAL = "CASUAL"
    BOT = "BOT"


class GameCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    game_id: Optional[UUID] = Field(default=None, alias="gameId")
    white_player_id: UUID = Field(..., alias="whitePlayerId")
    black_player_id: UUID = Field(..., alias="blackPlayerId")
    result: GameResult
    time_control: str = Field(..., alias="timeControl")
    time_control_bucket: str = Field(..., alias="timeControlBucket")
    mode: GameMode
    ended_at: datetime = Field(..., alias="endedAt")
    moves: Optional[int] = None

    def to_summary(self) -> "GameSummary":
        return GameSummary(
            game_id=self.game_id or uuid4(),
            white_player_id=self.white_player_id,
            black_player_id=self.black_player_id,
            result=self.result,
            time_control=self.time_control,
            time_control_bucket=self.time_control_bucket,
            mode=self.mode,
            ended_at=self.ended_at,
            moves=self.moves,
        )


class GameSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    game_id: UUID = Field(..., alias="gameId")
    white_player_id: UUID = Field(..., alias="whitePlayerId")
    black_player_id: UUID = Field(..., alias="blackPlayerId")
    result: GameResult
    time_control: str = Field(..., alias="timeControl")
    time_control_bucket: str = Field(..., alias="timeControlBucket")
    mode: GameMode
    ended_at: datetime = Field(..., alias="endedAt")
    moves: Optional[int] = None
