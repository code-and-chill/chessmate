import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_make_move_start_position():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "game_id": "g_123",
            "bot_color": "black",
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
            "move_number": 1,
            "clocks": {"white_ms": 300000, "black_ms": 300000, "increment_ms": 2000},
            "metadata": {"time_control_code": "blitz_3+2", "rated": True, "pool_id": "blitz_standard"},
            "debug": True,
        }
        resp = await ac.post("/v1/bots/bot_blitz_1200/move", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["game_id"] == "g_123"
        assert "move" in data and isinstance(data["move"], str)
