from fastapi import APIRouter

from app.domain.models import EvaluateRequest, EvaluateResponse
from app.engine.evaluator import evaluate_position

router = APIRouter()


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(request: EvaluateRequest) -> EvaluateResponse:
    """Evaluate a chess position and return candidate moves with evaluations."""
    candidates, time_ms = await evaluate_position(request)
    return EvaluateResponse(
        candidates=candidates,
        fen=request.fen,
        time_ms=time_ms,
    )
