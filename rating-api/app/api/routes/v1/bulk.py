from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_auth
from app.domain.models import RatingPool, UserRating
from app.domain.schemas import BulkRatingsRequest, BulkRatingsResponse, BulkRatingsResponseItem
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1/ratings", tags=["ratings"])


@router.post("/bulk", response_model=BulkRatingsResponse)
async def bulk_fetch(
    body: BulkRatingsRequest,
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == body.pool_id))).scalar_one_or_none()
    results: list[BulkRatingsResponseItem] = []
    if not pool:
        # Unknown pool: return empty entries
        return BulkRatingsResponse(pool_id=body.pool_id, results=[BulkRatingsResponseItem(user_id=u) for u in body.user_ids])

    rows = (
        await db.execute(
            select(UserRating).where(UserRating.user_id.in_(body.user_ids), UserRating.pool_id == pool.id)
        )
    ).scalars().all()
    by_user = {r.user_id: r for r in rows}
    for uid in body.user_ids:
        r = by_user.get(uid)
        if not r:
            results.append(BulkRatingsResponseItem(user_id=uid))
        else:
            results.append(
                BulkRatingsResponseItem(
                    user_id=uid,
                    rating=r.rating,
                    rating_deviation=r.rating_deviation,
                    volatility=r.volatility,
                    games_played=r.games_played,
                    provisional=r.provisional,
                    last_updated_at=r.last_updated_at,
                )
            )
    return BulkRatingsResponse(pool_id=body.pool_id, results=results)
