from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_auth
from app.domain.models import RatingEvent, RatingPool, UserRating
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1/admin", tags=["admin"])


@router.post("/users/{user_id}/adjust")
async def manual_adjust(
    user_id: str = Path(...),
    body: dict = {},
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    pool_code = body.get("pool_id")
    if not pool_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="pool_id required")
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == pool_code))).scalar_one_or_none()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")

    ur = (
        await db.execute(select(UserRating).where(UserRating.user_id == user_id, UserRating.pool_id == pool.id))
    ).scalar_one_or_none()
    if not ur:
        ur = UserRating(
            user_id=user_id,
            pool_id=pool.id,
            rating=pool.initial_rating,
            rating_deviation=pool.glicko_default_rd,
            volatility=0.06,
            provisional=True,
            games_played=0,
        )
        db.add(ur)
        await db.flush()

    before = (ur.rating, ur.rating_deviation, ur.volatility)
    if "rating" in body:
        ur.rating = float(body["rating"])
    if "rating_deviation" in body:
        ur.rating_deviation = float(body["rating_deviation"])
    if "volatility" in body:
        ur.volatility = float(body["volatility"])
    ur.last_updated_at = datetime.utcnow()

    db.add(
        RatingEvent(
            user_id=user_id,
            pool_id=pool.id,
            game_id=None,
            old_rating=before[0],
            new_rating=ur.rating,
            old_rd=before[1],
            new_rd=ur.rating_deviation,
            old_volatility=before[2],
            new_volatility=ur.volatility,
            reason="admin_adjustment",
        )
    )
    await db.commit()
    return {"status": "ok", "user_id": user_id, "pool_id": pool_code, "rating": ur.rating}
