"""Admin endpoints for leaderboard recomputation."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_auth
from app.domain.rating_pool import RatingPool
from app.infrastructure.database import get_db_session
from app.infrastructure.leaderboard_service import get_leaderboard_service

router = APIRouter(prefix="/v1/admin", tags=["admin"])


@router.post("/leaderboards/{pool_id}/recompute")
async def recompute_leaderboard(
    pool_id: str,
    _: None = Depends(require_auth),  # Require authentication (admin only)
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Recompute leaderboard for a pool.

    Args:
        pool_id: Pool code (e.g., "blitz_standard")
        _: Authentication dependency
        db: Database session

    Returns:
        Success message with count of entries updated

    Raises:
        HTTPException: If pool not found
    """
    # Get pool
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == pool_id))).scalar_one_or_none()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")

    # Recompute leaderboard
    service = get_leaderboard_service()
    count = await service.recompute_all_ranks(pool.id, db)
    await db.commit()

    return {
        "message": "Leaderboard recomputed",
        "pool_id": pool_id,
        "entries_updated": count,
    }
