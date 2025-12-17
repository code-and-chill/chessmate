"""Admin endpoints for cache management."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_knowledge_cache

router = APIRouter(prefix="/admin", tags=["admin"])


class CacheInvalidationRequest(BaseModel):
    """Request model for cache invalidation."""
    fen: str | None = None  # If provided, invalidate specific entry; otherwise invalidate all
    cache_type: str  # "opening" or "tablebase"


class CacheInvalidationResponse(BaseModel):
    """Response model for cache invalidation."""
    deleted_count: int
    cache_type: str
    message: str


@router.post("/cache/invalidate", response_model=CacheInvalidationResponse)
async def invalidate_cache(
    request: CacheInvalidationRequest,
    cache = Depends(get_knowledge_cache),
) -> CacheInvalidationResponse:
    """Invalidate cache entries.
    
    Args:
        request: Cache invalidation request with cache_type and optional fen
        cache: KnowledgeCache instance
    
    Returns:
        CacheInvalidationResponse with number of deleted entries
    """
    if not cache:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cache is not enabled",
        )

    if request.cache_type == "opening":
        deleted_count = await cache.invalidate_opening_cache(request.fen)
        message = f"Invalidated {deleted_count} opening cache entries"
        if request.fen:
            message = f"Invalidated opening cache entry for FEN: {request.fen}"
    elif request.cache_type == "tablebase":
        deleted_count = await cache.invalidate_tablebase_cache(request.fen)
        message = f"Invalidated {deleted_count} tablebase cache entries"
        if request.fen:
            message = f"Invalidated tablebase cache entry for FEN: {request.fen}"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid cache_type: {request.cache_type}. Must be 'opening' or 'tablebase'",
        )

    return CacheInvalidationResponse(
        deleted_count=deleted_count,
        cache_type=request.cache_type,
        message=message,
    )
