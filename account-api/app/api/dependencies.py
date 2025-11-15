from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_token
from app.domain.services.account_service import AccountService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories import (
    AccountRepository,
    MediaRepository,
    PreferencesRepository,
    PrivacySettingsRepository,
    ProfileDetailsRepository,
    SocialCountersRepository,
)

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """Extract user ID from JWT token."""
    try:
        payload = verify_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        try:
            return UUID(user_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def get_account_service(
    session: AsyncSession = Depends(get_db_session),
) -> AccountService:
    """Get account service with all repositories."""
    account_repo = AccountRepository(session)
    profile_details_repo = ProfileDetailsRepository(session)
    media_repo = MediaRepository(session)
    preferences_repo = PreferencesRepository(session)
    privacy_settings_repo = PrivacySettingsRepository(session)
    social_counters_repo = SocialCountersRepository(session)

    return AccountService(
        account_repository=account_repo,
        profile_details_repository=profile_details_repo,
        media_repository=media_repo,
        preferences_repository=preferences_repo,
        privacy_settings_repository=privacy_settings_repo,
        social_counters_repository=social_counters_repo,
    )
