from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


Color = Literal["white", "black"]
Phase = Literal["opening", "middlegame", "endgame"]
MistakeType = Literal["none", "inaccuracy", "mistake", "blunder"]


class Clocks(BaseModel):
    white_ms: int
    black_ms: int
    increment_ms: int = 0


class MoveRequest(BaseModel):
    game_id: str
    bot_color: Color
    fen: str
    move_number: int
    clocks: Clocks
    metadata: dict = Field(default_factory=dict)
    debug: bool = False


class Candidate(BaseModel):
    move: str
    eval: float
    depth: Optional[int] = None


class EngineQuery(BaseModel):
    time_limit_ms: int
    max_depth: int
    multi_pv: int


class ChosenReason(BaseModel):
    style_bias: Optional[str] = None
    eval_loss: Optional[float] = None


class DebugInfo(BaseModel):
    phase: Optional[Phase] = None
    mistake_type: Optional[MistakeType] = None
    engine_query: Optional[EngineQuery] = None
    candidates: Optional[List[Candidate]] = None
    chosen_reason: Optional[ChosenReason] = None


class MoveResponse(BaseModel):
    game_id: str
    bot_id: str
    move: str
    thinking_time_ms: int
    debug_info: Optional[DebugInfo] = None


# BotSpec models (simplified to match spec)
class SearchSpec(BaseModel):
    depth_min: int
    depth_max: int
    multi_pv: int
    think_time_ms_min: int
    think_time_ms_max: int


class MistakeModel(BaseModel):
    inaccuracy_prob: float
    mistake_prob: float
    blunder_prob: float
    eval_noise_sigma: float = 0.0


class StyleSpec(BaseModel):
    weight_attack: float
    weight_safety: float
    weight_simplify: float
    prefers_gambits: bool = False


class OpeningSpec(BaseModel):
    use_book_until_ply: int = 0
    repertoire: Optional[str] = None


class EndgameSpec(BaseModel):
    allow_tablebases: bool = True
    reduce_mistakes_in_simple_endgames: bool = True


class BotSpec(BaseModel):
    target_rating: int
    search: SearchSpec
    mistake_model: MistakeModel
    style: StyleSpec
    opening: OpeningSpec = OpeningSpec()
    endgame: EndgameSpec = EndgameSpec()


class BotSpecEnvelope(BaseModel):
    bot_id: str
    version: str
    spec: BotSpec
