from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    settings = get_settings()
    return {"status": "ok", "service": settings.SERVICE_NAME}
