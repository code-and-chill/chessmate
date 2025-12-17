from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_knowledge_cache
from app.domain.tablebase import TablebaseRequest, TablebaseResponse
from app.services.tablebase import query_tablebase

router = APIRouter()


@router.post("/endgame/tablebase", response_model=TablebaseResponse)
async def get_tablebase_move(
    request: TablebaseRequest,
    response: Response,
    cache = Depends(get_knowledge_cache),
):
    """Query endgame tablebase for best move in a given position."""
    result = await query_tablebase(request, cache)

    if result is None:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    return result
