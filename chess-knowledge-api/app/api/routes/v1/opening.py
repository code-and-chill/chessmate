from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_knowledge_cache
from app.domain.opening_book import OpeningBookRequest, OpeningBookResponse
from app.services.opening_book import query_opening_book

router = APIRouter()


@router.post("/opening/book-moves", response_model=OpeningBookResponse)
async def get_opening_moves(
    request: OpeningBookRequest,
    response: Response,
    cache = Depends(get_knowledge_cache),
):
    """Query opening book for moves in a given position."""
    moves = await query_opening_book(request, cache)

    if moves is None:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    return OpeningBookResponse(moves=moves, fen=request.fen)
