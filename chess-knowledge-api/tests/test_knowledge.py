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
async def test_opening_book():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "repertoire": None}
        resp = await ac.post("/v1/opening/book-moves", json=payload)
        assert resp.status_code in [200, 204]
        if resp.status_code == 200:
            data = resp.json()
            assert "moves" in data


@pytest.mark.asyncio
async def test_tablebase():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {"fen": "8/8/8/8/8/4k3/4P3/4K3 w - - 0 1"}
        resp = await ac.post("/v1/endgame/tablebase", json=payload)
        assert resp.status_code in [200, 204]
        if resp.status_code == 200:
            data = resp.json()
            assert "best_move" in data
