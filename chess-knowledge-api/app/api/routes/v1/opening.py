from fastapi import APIRouter, Response, status

from app.domain.models import OpeningBookRequest, OpeningBookResponse
from app.services.opening_book import query_opening_book

router = APIRouter()


@router.post("/opening/book-moves", response_model=OpeningBookResponse)
async def get_opening_moves(request: OpeningBookRequest, response: Response):
    """Query opening book for moves in a given position."""
    moves = await query_opening_book(request)

    if moves is None:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    return OpeningBookResponse(moves=moves, fen=request.fen)
