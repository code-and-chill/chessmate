from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_auth
from app.domain.rating_pool import RatingPool
from app.domain.user_rating import UserRating
from app.domain.schemas import RatingSnapshot, UserRatingsResponse
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1/ratings", tags=["ratings"])


@router.get("/{user_id}", response_model=UserRatingsResponse)
async def get_user_ratings(
    user_id: str,
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    pool_map = {p.id: p.code for p in (await db.execute(select(RatingPool))).scalars().all()}
    result = await db.execute(select(UserRating).where(UserRating.user_id == user_id))
    rows = result.scalars().all()
    snapshots: list[RatingSnapshot] = []
    for r in rows:
        snapshots.append(
            RatingSnapshot(
                pool_id=pool_map.get(r.pool_id, str(r.pool_id)),
                rating=r.rating,
                rating_deviation=r.rating_deviation,
                volatility=r.volatility,
                games_played=r.games_played,
                provisional=r.provisional,
                last_updated_at=r.last_updated_at,
            )
        )
    return UserRatingsResponse(user_id=user_id, ratings=snapshots)


@router.get("/{user_id}/pools/{pool_id}", response_model=RatingSnapshot)
async def get_user_rating_in_pool(
    user_id: str,
    pool_id: str,
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == pool_id))).scalar_one_or_none()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")
    ur = (
        await db.execute(
            select(UserRating).where(UserRating.user_id == user_id, UserRating.pool_id == pool.id)
        )
    ).scalar_one_or_none()
    if not ur:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found")
    return RatingSnapshot(
        pool_id=pool.code,
        rating=ur.rating,
        rating_deviation=ur.rating_deviation,
        volatility=ur.volatility,
        games_played=ur.games_played,
        provisional=ur.provisional,
        last_updated_at=ur.last_updated_at,
    )
