from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import get_repository
from app.core.models import Mode, PerformanceResponse, PlayerOverviewResponse, RatingTrendResponse, RecentFormResponse, TimeControlBucket
from app.services.repository import InsightsRepository

router = APIRouter(prefix="/insights/v1", tags=["insights"])


@router.get("/health")
def health(repo: InsightsRepository = Depends(get_repository)):
    return repo.health()


@router.get("/players/{player_id}/overview", response_model=PlayerOverviewResponse)
def get_overview(
    player_id: str,
    includeTimeControls: bool = Query(True, alias="includeTimeControls"),
    includeRecentWindow: bool = Query(True, alias="includeRecentWindow"),
    repo: InsightsRepository = Depends(get_repository),
):
    return repo.get_overview(player_id, include_time_controls=includeTimeControls, include_recent_window=includeRecentWindow)


@router.get("/players/{player_id}/performance", response_model=PerformanceResponse)
def get_performance(
    player_id: str,
    timeControlBucket: Optional[TimeControlBucket] = Query(None, alias="timeControlBucket"),
    window: str = Query("ALL_TIME"),
    mode: Optional[Mode] = Query(None),
    repo: InsightsRepository = Depends(get_repository),
):
    result = repo.get_performance(player_id, time_control=timeControlBucket, window=window, mode=mode)
    if not result:
        raise HTTPException(status_code=404, detail="player not found")
    return result


@router.get("/players/{player_id}/rating-trend", response_model=RatingTrendResponse)
def get_rating_trend(
    player_id: str,
    timeControlBucket: TimeControlBucket = Query(..., alias="timeControlBucket"),
    from_: Optional[datetime] = Query(None, alias="from"),
    to: Optional[datetime] = Query(None),
    maxPoints: int = Query(100, alias="maxPoints"),
    repo: InsightsRepository = Depends(get_repository),
):
    result = repo.get_rating_trend(player_id, time_control=timeControlBucket, start=from_, end=to, max_points=maxPoints)
    if not result:
        raise HTTPException(status_code=404, detail="trend not found")
    return result


@router.get("/players/{player_id}/recent-form", response_model=RecentFormResponse)
def get_recent_form(
    player_id: str,
    timeControlBucket: Optional[TimeControlBucket] = Query(None, alias="timeControlBucket"),
    limit: int = Query(20),
    repo: InsightsRepository = Depends(get_repository),
):
    result = repo.get_recent_form(player_id, time_control=timeControlBucket, limit=limit)
    if not result:
        raise HTTPException(status_code=404, detail="player not found")
    return result


@router.post("/admin/players/{player_id}/recompute")
def recompute_player(player_id: str, repo: InsightsRepository = Depends(get_repository)):
    return repo.recompute_player(player_id)


@router.post("/admin/recompute-range")
def recompute_range(
    start: datetime = Query(..., alias="from"),
    end: datetime = Query(..., alias="to"),
    repo: InsightsRepository = Depends(get_repository),
):
    return repo.recompute_range(start=start, end=end)
