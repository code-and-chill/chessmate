from __future__ import annotations
from typing import List
import asyncio
import httpx

from app.core.config import get_settings
from app.domain.candidate import Candidate
from app.domain.move_response import EngineQuery


async def evaluate_position(fen: str, side_to_move: str, query: EngineQuery) -> List[Candidate]:
    settings = get_settings()
    if not settings.ENGINE_CLUSTER_URL:
        # Fallback mock candidates for local dev
        # Sorted as if best-first
        base = [
            Candidate(move="c7c5", eval=0.20, depth=query.max_depth),
            Candidate(move="e7e5", eval=0.18, depth=query.max_depth),
            Candidate(move="g8f6", eval=0.15, depth=query.max_depth - 1),
            Candidate(move="d7d5", eval=0.05, depth=query.max_depth - 1),
        ]
        # Simulate latency roughly equal to query time limit but capped
        await asyncio.sleep(min(query.time_limit_ms, 200) / 1000.0)
        return base[: query.multi_pv]

    async with httpx.AsyncClient(timeout=settings.HTTP_CLIENT_TIMEOUT_MS / 1000.0) as client:
        resp = await client.post(
            f"{settings.ENGINE_CLUSTER_URL.rstrip('/')}/v1/evaluate",
            json={
                "fen": fen,
                "side_to_move": side_to_move[0],
                "max_depth": query.max_depth,
                "time_limit_ms": query.time_limit_ms,
                "multi_pv": query.multi_pv,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return [Candidate(**c) for c in data.get("candidates", [])]
