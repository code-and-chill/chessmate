from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ERROR_INVALID_CREDENTIALS, ERROR_INVALID_TOKEN_USER_ID
from app.core.logging import get_logger
from app.core.security import verify_token
from app.domain.services.account_service import AccountService
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.account_repository import AccountRepository
from app.infrastructure.repositories.media_repository import MediaRepository
from app.infrastructure.repositories.preferences_repository import PreferencesRepository
from app.infrastructure.repositories.privacy_settings_repository import (
    PrivacySettingsRepository,
)
from app.infrastructure.repositories.profile_details_repository import (
    ProfileDetailsRepository,
)
from app.infrastructure.repositories.social_counters_repository import (
    SocialCountersRepository,
)

security = HTTPBearer()
logger = get_logger(__name__)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """
    Extract and validate user ID from JWT token.
    
    This dependency validates the JWT token from the Authorization header,
    extracts the user ID from the 'sub' claim, and returns it as a UUID.
    
    Args:
        credentials: HTTP Bearer credentials containing JWT token
        
    Returns:
        UUID of the authenticated user
        
    Raises:
        HTTPException: If token is invalid, expired, or missing user ID
        
    Example:
        ```python
        @router.get("/me")
        async def get_me(user_id: UUID = Depends(get_current_user_id)):
            return {"user_id": user_id}
        ```
    """
    try:
        payload = verify_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        
        if user_id_str is None:
            logger.warning("auth.token.missing_subject")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS,
            )
        
        try:
            user_id = UUID(user_id_str)
            logger.debug("auth.token.validated", user_id=str(user_id))
            return user_id
        except ValueError as e:
            logger.warning("auth.token.invalid_uuid", user_id_str=user_id_str, error=str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_TOKEN_USER_ID,
            )
    except HTTPException:
        raise
    except JWTError as e:
        logger.warning("auth.token.jwt_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_INVALID_CREDENTIALS,
        )
    except Exception as e:
        logger.error("auth.token.unexpected_error", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_INVALID_CREDENTIALS,
        )


async def get_account_service(
    session: AsyncSession = Depends(get_db_session),
) -> AccountService:
    """
    Get account service with all required dependencies injected.
    
    This dependency creates an AccountService instance with all repository
    implementations properly initialized with the current database session.
    
    Args:
        session: SQLAlchemy async database session
        
    Returns:
        Configured AccountService instance with all repositories
        
    Example:
        ```python
        @router.post("/accounts")
        async def create_account(
            data: CreateAccountRequest,
            service: AccountService = Depends(get_account_service)
        ):
            return await service.create_account(**data.dict())
        ```
    """
    logger.debug("dependencies.account_service.creating")
    
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
