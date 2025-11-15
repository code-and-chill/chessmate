import os
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ingestion_idempotent(monkeypatch):
    # Use sqlite for test
    monkeypatch.setenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    monkeypatch.setenv("REQUIRE_AUTH", "false")

    from app.main import create_app

    app = create_app()
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create pool
        resp = await client.post(
            "/v1/admin/pools",
            json={
                "code": "blitz_standard",
                "initial_rating": 1500,
                "glicko_tau": 0.5,
                "glicko_default_rd": 350,
            },
        )
        assert resp.status_code == 200

        payload = {
            "game_id": "g_idem_1",
            "pool_id": "blitz_standard",
            "white_user_id": "u_w",
            "black_user_id": "u_b",
            "result": "white_win",
            "rated": True,
            "ended_at": "2025-11-15T20:10:00Z",
        }

        r1 = await client.post("/v1/game-results", json=payload)
        assert r1.status_code == 200
        data1 = r1.json()

        r2 = await client.post("/v1/game-results", json=payload)
        assert r2.status_code in (200, 409)
        if r2.status_code == 200:
            data2 = r2.json()
            assert data2 == data1

        # games_played should be 1 for both players
        rw = await client.get("/v1/ratings/u_w/pools/blitz_standard")
        rb = await client.get("/v1/ratings/u_b/pools/blitz_standard")
        assert rw.status_code == 200 and rb.status_code == 200
        assert rw.json()["games_played"] == 1
        assert rb.json()["games_played"] == 1
