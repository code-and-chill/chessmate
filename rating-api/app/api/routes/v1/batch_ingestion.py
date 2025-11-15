from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.v1.game_results import ingest_game_result  # reuse handler
from app.core.security import require_auth
from app.domain.schemas import GameResultIn, GameResultOut
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1", tags=["ingestion"])


@router.post("/game-results/batch", response_model=List[GameResultOut])
async def ingest_batch(
    items: List[GameResultIn],
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    results: list[GameResultOut] = []
    # Process sequentially to keep it simple and deterministic for now
    for item in items:
        # Delegate to single ingestion endpoint using same db session
        res = await ingest_game_result(item, _, db)
        results.append(res)
    return results
