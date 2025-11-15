from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_auth
from app.domain.models import RatingPool
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1/admin/pools", tags=["admin"])


@router.post("")
async def upsert_pool(
    body: dict,
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    code = body.get("code")
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="code required")
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == code))).scalar_one_or_none()
    if not pool:
        pool = RatingPool(code=code)
        db.add(pool)
    # minimal updates
    for field in (
        "description",
        "time_control_min",
        "time_control_max",
        "variant",
        "mode",
        "rating_system",
        "initial_rating",
        "glicko_tau",
        "glicko_default_rd",
        "is_active",
    ):
        if field in body:
            setattr(pool, field, body[field])
    await db.commit()
    return {"status": "ok", "code": pool.code}
