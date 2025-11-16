from fastapi import APIRouter, Path, Query

from app.clients.config import fetch_spec
from app.domain.bot_spec import BotSpecEnvelope
from app.domain.move_request import MoveRequest
from app.domain.move_response import MoveResponse
from app.logic.orchestrator import orchestrate_move, get_last_moves

router = APIRouter()


@router.post("/bots/{bot_id}/move", response_model=MoveResponse)
async def make_move(
    request: MoveRequest, bot_id: str = Path(..., description="Bot identifier"),
) -> MoveResponse:
    return await orchestrate_move(bot_id, request)


@router.get("/bots/{bot_id}/spec", response_model=BotSpecEnvelope)
async def get_spec(bot_id: str = Path(..., description="Bot identifier")) -> BotSpecEnvelope:
    return await fetch_spec(bot_id)


@router.get("/debug/last-moves")
async def last_moves(bot_id: str | None = Query(default=None), limit: int = Query(default=20, ge=1, le=200)) -> list[dict]:
    return get_last_moves(bot_id=bot_id, limit=limit)
