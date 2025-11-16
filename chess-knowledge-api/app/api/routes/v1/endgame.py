from fastapi import APIRouter, Response, status

from app.domain.models import TablebaseRequest, TablebaseResponse
from app.services.tablebase import query_tablebase

router = APIRouter()


@router.post("/endgame/tablebase", response_model=TablebaseResponse)
async def get_tablebase_move(request: TablebaseRequest, response: Response):
    """Query endgame tablebase for best move in a given position."""
    result = await query_tablebase(request)

    if result is None:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    return result
