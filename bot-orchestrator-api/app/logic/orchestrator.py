from __future__ import annotations
import math
import random
from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict, List, Optional, Tuple

from app.clients.config import fetch_spec
from app.clients.engine import evaluate_position
from app.clients.knowledge import get_opening_book_move, get_tablebase_move
from app.domain.models import (
    BotSpecEnvelope,
    Candidate,
    ChosenReason,
    DebugInfo,
    EngineQuery,
    MistakeType,
    MoveRequest,
    MoveResponse,
)


_LAST_MOVES: Deque[dict] = deque(maxlen=200)


@dataclass
class PhaseDecision:
    phase: str
    use_book: bool
    use_tablebase: bool


def detect_phase(move_number: int) -> PhaseDecision:
    if move_number <= 7:
        return PhaseDecision(phase="opening", use_book=True, use_tablebase=False)
    # Simplified heuristic
    if move_number >= 35:
        return PhaseDecision(phase="endgame", use_book=False, use_tablebase=True)
    return PhaseDecision(phase="middlegame", use_book=False, use_tablebase=False)


def decide_engine_params(spec_env: BotSpecEnvelope, clocks_ms: int, phase: str) -> EngineQuery:
    s = spec_env.spec.search
    # Simple time management: clamp think time between min/max scaled by remaining time
    # Use a fraction of remaining time based on phase
    phase_factor = 0.01 if phase == "opening" else (0.015 if phase == "middlegame" else 0.012)
    budget = int(max(s.think_time_ms_min, min(s.think_time_ms_max, clocks_ms * phase_factor)))
    depth = max(s.depth_min, min(s.depth_max, s.depth_min + (budget // 100)))
    return EngineQuery(time_limit_ms=budget, max_depth=depth, multi_pv=s.multi_pv)


def sample_mistake(m: Dict[str, float], time_ms: int, phase: str) -> MistakeType:
    # Increase mistake probability under time pressure
    pressure = 1.0 if time_ms > 20000 else (0.5 if time_ms > 10000 else 0.25)
    probs = {
        "none": max(0.0, 1.0 - (m["inaccuracy_prob"] + m["mistake_prob"] + m["blunder_prob"])) * pressure,
        "inaccuracy": m["inaccuracy_prob"] / pressure,
        "mistake": m["mistake_prob"] / pressure,
        "blunder": m["blunder_prob"] / pressure,
    }
    # Normalize
    total = sum(probs.values()) or 1.0
    r = random.random() * total
    acc = 0.0
    for k, v in probs.items():
        acc += v
        if r <= acc:
            return k  # type: ignore
    return "none"  # fallback


def mistake_band(candidates: List[Candidate], mistake: MistakeType) -> List[Candidate]:
    if not candidates:
        return []
    best_eval = candidates[0].eval
    bands = {
        "none": 0.01,
        "inaccuracy": 0.20,
        "mistake": 0.60,
        "blunder": 2.00,
    }
    thresh = bands.get(mistake, 0.01)
    return [c for c in candidates if (best_eval - c.eval) <= thresh]


def apply_style_weights(candidates: List[Candidate], style: dict, rng: random.Random) -> Tuple[Candidate, str]:
    # Placeholder style: small random bias to top-N weighted by attack/safety
    if not candidates:
        raise ValueError("No candidates to choose from")
    bias = style.get("weight_attack", 0.0) - style.get("weight_safety", 0.0)
    idx = 0
    if len(candidates) >= 2 and rng.random() < (0.3 + 0.2 * bias):
        idx = 1
    if len(candidates) >= 3 and rng.random() < max(0.0, 0.1 + 0.1 * bias):
        idx = 2
    chosen = candidates[min(idx, len(candidates) - 1)]
    bias_label = "slightly aggressive" if bias > 0 else ("solid" if bias == 0 else "safety-first")
    return chosen, bias_label


async def orchestrate_move(bot_id: str, req: MoveRequest) -> MoveResponse:
    spec_env = await fetch_spec(bot_id)

    # Detect phase and try knowledge sources
    phase_decision = detect_phase(req.move_number)

    # Opening book
    if phase_decision.use_book and spec_env.spec.opening.use_book_until_ply >= req.move_number * 2:
        book_move = await get_opening_book_move(req.fen, spec_env.spec.opening.repertoire)
        if book_move:
            resp = MoveResponse(
                game_id=req.game_id,
                bot_id=bot_id,
                move=book_move,
                thinking_time_ms=50,
                debug_info=DebugInfo(phase="opening", mistake_type="none" if req.debug else None),
            )
            _record_move(resp)
            return resp

    # Endgame tablebase
    if phase_decision.use_tablebase and spec_env.spec.endgame.allow_tablebases:
        tb_move = await get_tablebase_move(req.fen)
        if tb_move and spec_env.spec.endgame.reduce_mistakes_in_simple_endgames:
            resp = MoveResponse(
                game_id=req.game_id,
                bot_id=bot_id,
                move=tb_move,
                thinking_time_ms=40,
                debug_info=DebugInfo(phase="endgame", mistake_type="none" if req.debug else None),
            )
            _record_move(resp)
            return resp

    # Engine parameters
    remaining_ms = req.clocks.black_ms if req.bot_color == "black" else req.clocks.white_ms
    engine_query = decide_engine_params(spec_env, remaining_ms, phase_decision.phase)

    # Engine evaluation
    candidates = await evaluate_position(req.fen, req.bot_color, engine_query)
    candidates = sorted(candidates, key=lambda c: c.eval, reverse=True)

    # Mistake model
    m = spec_env.spec.mistake_model
    mistake_choice = sample_mistake(
        {
            "inaccuracy_prob": m.inaccuracy_prob,
            "mistake_prob": m.mistake_prob,
            "blunder_prob": m.blunder_prob,
        },
        remaining_ms,
        phase_decision.phase,
    )
    allowed = mistake_band(candidates, mistake_choice)
    if not allowed:
        allowed = candidates or [Candidate(move="0000", eval=-10.0)]

    # Style and final choice (seeded determinism if metadata has seed)
    seed = req.metadata.get("seed") if isinstance(req.metadata, dict) else None
    rng = random.Random(seed)
    chosen, bias_label = apply_style_weights(allowed, spec_env.spec.style.model_dump(), rng)

    resp = MoveResponse(
        game_id=req.game_id,
        bot_id=bot_id,
        move=chosen.move,
        thinking_time_ms=engine_query.time_limit_ms,
        debug_info=DebugInfo(
            phase=phase_decision.phase if req.debug else None,
            mistake_type=mistake_choice if req.debug else None,
            engine_query=engine_query if req.debug else None,
            candidates=allowed if req.debug else None,
            chosen_reason=ChosenReason(style_bias=bias_label, eval_loss=round((allowed[0].eval - chosen.eval), 2))
            if req.debug and allowed
            else None,
        ),
    )
    _record_move(resp)
    return resp


def _record_move(resp: MoveResponse) -> None:
    _LAST_MOVES.append(
        {
            "game_id": resp.game_id,
            "bot_id": resp.bot_id,
            "move": resp.move,
            "thinking_time_ms": resp.thinking_time_ms,
            "debug": resp.debug_info.model_dump() if resp.debug_info else None,
        }
    )


def get_last_moves(bot_id: Optional[str] = None, limit: int = 20) -> List[dict]:
    items = list(_LAST_MOVES)
    if bot_id:
        items = [x for x in items if x.get("bot_id") == bot_id]
    return items[-limit:]
