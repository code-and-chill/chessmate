from __future__ import annotations
from typing import Optional
import httpx

from app.core.config import get_settings


async def get_opening_book_move(fen: str, repertoire: Optional[str]) -> Optional[str]:
    settings = get_settings()
    if not settings.CHESS_KNOWLEDGE_URL:
        return None
    async with httpx.AsyncClient(timeout=settings.HTTP_CLIENT_TIMEOUT_MS / 1000.0) as client:
        resp = await client.post(
            f"{settings.CHESS_KNOWLEDGE_URL.rstrip('/')}/v1/opening/book-moves",
            json={"fen": fen, "repertoire": repertoire},
        )
        if resp.status_code == 204:
            return None
        resp.raise_for_status()
        payload = resp.json()
        # Assume API returns { moves: [{move: "e2e4", weight: 0.6}, ...] }
        moves = payload.get("moves", [])
        return moves[0]["move"] if moves else None


async def get_tablebase_move(fen: str) -> Optional[str]:
    settings = get_settings()
    if not settings.CHESS_KNOWLEDGE_URL:
        return None
    async with httpx.AsyncClient(timeout=settings.HTTP_CLIENT_TIMEOUT_MS / 1000.0) as client:
        resp = await client.post(
            f"{settings.CHESS_KNOWLEDGE_URL.rstrip('/')}/v1/endgame/tablebase",
            json={"fen": fen},
        )
        if resp.status_code == 204:
            return None
        resp.raise_for_status()
        payload = resp.json()
        return payload.get("best_move")
