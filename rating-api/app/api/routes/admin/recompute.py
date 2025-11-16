from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_auth
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1/admin", tags=["admin"])


@router.post("/recompute")
async def trigger_recompute(
    body: dict,
    _: None = Depends(require_auth),
    __db: AsyncSession = Depends(get_db_session),
):
    # Placeholder: In a future iteration, enqueue a recompute job
    scope = {
        "user_id": body.get("user_id"),
        "pool_id": body.get("pool_id"),
        "time_from": body.get("time_from"),
        "time_to": body.get("time_to"),
    }
    return {"status": "accepted", "scheduled_at": datetime.now(timezone.utc).isoformat() + "Z", "scope": scope}
