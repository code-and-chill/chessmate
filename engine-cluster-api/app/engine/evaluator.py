from __future__ import annotations
import asyncio
import shutil
import time
from typing import List, Optional
import chess
import chess.engine

from app.core.config import get_settings
from app.domain.models import Candidate, EvaluateRequest


async def evaluate_position(request: EvaluateRequest) -> tuple[List[Candidate], int]:
    """
    Evaluate a chess position using Stockfish (or mock if unavailable).
    Returns (candidates, time_ms).
    """
    settings = get_settings()
    stockfish_path = settings.STOCKFISH_PATH or shutil.which("stockfish")

    if not stockfish_path:
        # Mock fallback for development
        return await _mock_evaluation(request)

    start = time.time()
    board = chess.Board(request.fen)

    try:
        transport, engine = await chess.engine.popen_uci(stockfish_path)
        await engine.configure({"Threads": settings.ENGINE_THREADS, "Hash": settings.ENGINE_HASH_MB})

        limit = chess.engine.Limit(
            time=request.time_limit_ms / 1000.0,
            depth=request.max_depth,
        )

        analysis = await engine.analysis(board, limit, multipv=request.multi_pv)

        candidates = []
        async for info in analysis:
            if "multipv" in info and "score" in info and "pv" in info:
                pv_index = info["multipv"]
                score = info["score"]
                pv = info["pv"]
                depth = info.get("depth", request.max_depth)

                # Convert score to float (centipawns -> pawns)
                if score.is_mate():
                    eval_value = 100.0 if score.relative.mate() > 0 else -100.0
                else:
                    eval_value = score.relative.score() / 100.0

                move_uci = str(pv[0]) if pv else "0000"
                pv_uci = [str(m) for m in pv[:8]]  # Limit PV length

                candidates.append(
                    Candidate(
                        move=move_uci,
                        eval=round(eval_value, 2),
                        depth=depth,
                        pv=pv_uci,
                    )
                )

                if len(candidates) >= request.multi_pv:
                    break

        await engine.quit()

        elapsed_ms = int((time.time() - start) * 1000)
        return candidates, elapsed_ms

    except Exception as e:
        # Fallback on any engine error
        return await _mock_evaluation(request)


async def _mock_evaluation(request: EvaluateRequest) -> tuple[List[Candidate], int]:
    """Mock evaluation for dev/testing when engine unavailable."""
    await asyncio.sleep(min(request.time_limit_ms, 100) / 1000.0)

    # Generate plausible mock candidates
    board = chess.Board(request.fen)
    legal_moves = list(board.legal_moves)[:request.multi_pv * 2]

    candidates = []
    for i, move in enumerate(legal_moves[:request.multi_pv]):
        eval_value = 0.20 - (i * 0.05)
        candidates.append(
            Candidate(
                move=str(move),
                eval=round(eval_value, 2),
                depth=request.max_depth,
                pv=[str(move)],
            )
        )

    return candidates, request.time_limit_ms
