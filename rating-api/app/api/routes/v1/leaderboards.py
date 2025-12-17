"""Leaderboard API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.leaderboard import Leaderboard
from app.domain.rating_pool import RatingPool
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1", tags=["leaderboards"])


class LeaderboardEntry(BaseModel):
    """Leaderboard entry model."""

    user_id: str
    rating: float
    rank: int

    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    """Leaderboard response model."""

    pool_id: str
    entries: list[LeaderboardEntry]
    total: int
    limit: int
    offset: int


@router.get("/leaderboards/{pool_id}", response_model=LeaderboardResponse)
async def get_leaderboard(
    pool_id: str,
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db_session),
) -> LeaderboardResponse:
    """Get leaderboard for a pool.

    Args:
        pool_id: Pool code (e.g., "blitz_standard")
        limit: Number of entries to return (1-1000)
        offset: Offset for pagination
        order: Sort order ("asc" or "desc")
        db: Database session

    Returns:
        Leaderboard entries

    Raises:
        HTTPException: If pool not found
    """
    # Get pool
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == pool_id))).scalar_one_or_none()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")

    # Build query
    query = select(Leaderboard).where(Leaderboard.pool_id == pool.id)

    # Order by rating
    if order == "desc":
        query = query.order_by(Leaderboard.rating.desc())
    else:
        query = query.order_by(Leaderboard.rating.asc())

    # Apply pagination
    query = query.offset(offset).limit(limit)

    # Get total count
    total = (await db.execute(select(func.count(Leaderboard.id)).where(Leaderboard.pool_id == pool.id))).scalar_one()

    # Execute query
    entries = (await db.execute(query)).scalars().all()

    # Convert to response format (rating stored as int * 100, convert back)
    leaderboard_entries = [
        LeaderboardEntry(
            user_id=entry.user_id,
            rating=entry.rating / 100.0,  # Convert back to float
            rank=entry.rank,
        )
        for entry in entries
    ]

    return LeaderboardResponse(
        pool_id=pool_id,
        entries=leaderboard_entries,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/leaderboards/{pool_id}/user/{user_id}", response_model=LeaderboardEntry)
async def get_user_rank(
    pool_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> LeaderboardEntry:
    """Get user's rank in a pool.

    Args:
        pool_id: Pool code (e.g., "blitz_standard")
        user_id: User ID
        db: Database session

    Returns:
        User's leaderboard entry

    Raises:
        HTTPException: If pool or user not found
    """
    # Get pool
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == pool_id))).scalar_one_or_none()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")

    # Get leaderboard entry
    entry = (
        await db.execute(
            select(Leaderboard).where(
                Leaderboard.pool_id == pool.id,
                Leaderboard.user_id == user_id,
            )
        )
    ).scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in leaderboard")

    return LeaderboardEntry(
        user_id=entry.user_id,
        rating=entry.rating / 100.0,  # Convert back to float
        rank=entry.rank,
    )
