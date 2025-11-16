import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"


@pytest.mark.asyncio
async def test_evaluate_position():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "side_to_move": "w",
            "max_depth": 10,
            "time_limit_ms": 500,
            "multi_pv": 3,
        }
        resp = await ac.post("/v1/evaluate", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "candidates" in data
        assert len(data["candidates"]) > 0
        assert "move" in data["candidates"][0]
