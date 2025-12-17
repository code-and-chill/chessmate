"""Admin endpoints for backfill operations."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import require_auth
from app.infrastructure.events.backfill_service import get_backfill_service

router = APIRouter(prefix="/admin", tags=["admin"])


class BackfillRequest(BaseModel):
    """Backfill request model."""

    start_timestamp: datetime
    end_timestamp: Optional[datetime] = None
    pool_id: Optional[str] = None


class BackfillResponse(BaseModel):
    """Backfill response model."""

    job_id: str
    status: str
    start_timestamp: str
    end_timestamp: str
    pool_id: Optional[str] = None
    events_processed: int = 0
    events_skipped: int = 0
    errors: int = 0
    started_at: str


@router.post("/backfill", response_model=BackfillResponse)
async def start_backfill(
    request: BackfillRequest,
    _: None = Depends(require_auth),  # Require authentication (admin only)
) -> BackfillResponse:
    """Start a backfill job.

    Replays events from Kafka within the specified timestamp range.

    Args:
        request: Backfill request parameters
        _: Authentication dependency

    Returns:
        Backfill job status

    Raises:
        HTTPException: If backfill is already running
    """
    service = get_backfill_service()

    try:
        job = await service.start_backfill(
            start_timestamp=request.start_timestamp,
            end_timestamp=request.end_timestamp,
            pool_id=request.pool_id,
        )
        return BackfillResponse(**job)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/backfill/{job_id}", response_model=BackfillResponse)
async def get_backfill_status(
    job_id: str,
    _: None = Depends(require_auth),  # Require authentication (admin only)
) -> BackfillResponse:
    """Get status of a backfill job.

    Args:
        job_id: Backfill job ID
        _: Authentication dependency

    Returns:
        Backfill job status

    Raises:
        HTTPException: If job not found
    """
    service = get_backfill_service()
    job = await service.get_backfill_status(job_id)

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return BackfillResponse(**job)


@router.post("/backfill/{job_id}/cancel")
async def cancel_backfill(
    job_id: str,
    _: None = Depends(require_auth),  # Require authentication (admin only)
) -> dict:
    """Cancel a running backfill job.

    Args:
        job_id: Backfill job ID
        _: Authentication dependency

    Returns:
        Success message

    Raises:
        HTTPException: If job not found
    """
    service = get_backfill_service()
    cancelled = await service.cancel_backfill(job_id)

    if not cancelled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return {"message": "Backfill job cancelled", "job_id": job_id}
