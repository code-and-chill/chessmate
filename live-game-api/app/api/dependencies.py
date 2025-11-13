"""API dependencies."""

from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.security import extract_user_id_from_token
from app.infrastructure.database import get_db_session

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """Get current authenticated user from JWT token."""
    try:
        user_id = extract_user_id_from_token(credentials.credentials)
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


async def get_game_service(
    db: AsyncSession = Depends(get_db_session),
):
    """Get game service with dependencies."""
    from app.domain.repositories.game_repository import GameRepositoryInterface
    from app.domain.services.game_service import GameService
    from app.infrastructure.database.repository import GameRepository

    repository: GameRepositoryInterface = GameRepository(db)
    return GameService(repository)
