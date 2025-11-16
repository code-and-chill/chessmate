"""
Internal API routes for service-to-service account operations.

These endpoints are for internal use only and should not be exposed
to external clients. They provide privileged operations for other
services in the platform.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_account_service
from app.api.models import CreateAccountRequest
from app.core.exceptions import (
    AccountAlreadyExistsError,
    AccountNotFoundError,
    UnauthorizedError,
)
from app.core.logging import get_logger
from app.domain.services.account_service import AccountService

router = APIRouter(prefix="/internal/accounts", tags=["internal"])
logger = get_logger(__name__)


@router.post("/health")
async def health_check() -> dict:
    """
    Internal health check endpoint.
    
    Returns:
        Dictionary with status and service name
    """
    return {"status": "ok", "service": "account-api"}


@router.post("")
async def create_account(
    request: CreateAccountRequest,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """
    Create account for a newly-created auth user.
    
    This endpoint is called by the auth service after successful user registration
    to create the corresponding account profile.
    
    Args:
        request: Account creation request with auth_user_id and profile data
        account_service: Injected account service dependency
        
    Returns:
        Dictionary with account_id and username
        
    Raises:
        HTTPException: 409 if account already exists
    """
    logger.info(
        "internal.create_account.started",
        auth_user_id=str(request.auth_user_id),
        username=request.username,
    )
    try:
        account = await account_service.create_account(
            auth_user_id=request.auth_user_id,
            username=request.username,
            display_name=request.display_name,
            country_code=request.country_code,
            language_code=request.language_code,
            time_zone=request.time_zone,
        )
        logger.info(
            "internal.create_account.success",
            account_id=str(account.id),
            username=account.username,
        )
        return {"account_id": account.id, "username": account.username}
    except AccountAlreadyExistsError as e:
        logger.warning("internal.create_account.already_exists", error=str(e))
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/{account_id}")
async def get_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """
    Fetch full account record by ID (service-to-service only).
    
    Returns complete account data including profile, preferences, privacy settings,
    and social counters. This endpoint bypasses privacy settings and should only
    be used by trusted internal services.
    
    Args:
        account_id: UUID of the account to retrieve
        account_service: Injected account service dependency
        
    Returns:
        Dictionary with all account-related data
        
    Raises:
        HTTPException: 404 if account not found
    """
    logger.debug("internal.get_account", account_id=str(account_id))
    try:
        account_data = await account_service.get_full_account(account_id)

        return {
            "account": account_data["account"].model_dump(),
            "profile_details": account_data["profile_details"].model_dump(),
            "media": account_data["media"].model_dump(),
            "preferences": account_data["preferences"].model_dump(),
            "privacy_settings": account_data["privacy_settings"].model_dump(),
            "social_counters": account_data["social_counters"].model_dump(),
        }
    except AccountNotFoundError as e:
        logger.warning("internal.get_account.not_found", account_id=str(account_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/by-auth-user/{auth_user_id}")
async def get_account_by_auth_user(
    auth_user_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """
    Resolve account by auth_user_id.
    
    Maps an authentication service user ID to the corresponding account.
    Used by other services to look up account information based on auth tokens.
    
    Args:
        auth_user_id: Auth service user UUID
        account_service: Injected account service dependency
        
    Returns:
        Dictionary with account summary (id, username, display_name, status flags)
        
    Raises:
        HTTPException: 404 if no account exists for the auth_user_id
    """
    logger.debug("internal.get_by_auth_user", auth_user_id=str(auth_user_id))
    try:
        account = await account_service.get_account_by_auth_user_id(auth_user_id)

        return {
            "account_id": account.id,
            "username": account.username,
            "display_name": account.display_name,
            "is_active": account.is_active,
            "is_banned": account.is_banned,
        }
    except AccountNotFoundError as e:
        logger.warning("internal.get_by_auth_user.not_found", auth_user_id=str(auth_user_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/deactivate")
async def deactivate_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """
    Deactivate an account (admin/service-only).
    
    Marks an account as inactive, preventing login and access to services.
    This is typically used for user-requested account closure or administrative actions.
    
    Args:
        account_id: UUID of the account to deactivate
        account_service: Injected account service dependency
        
    Returns:
        Dictionary with account_id and is_active status
        
    Raises:
        HTTPException: 404 if account not found
    """
    logger.info("internal.deactivate_account", account_id=str(account_id))
    try:
        account = await account_service.deactivate_account(account_id)
        logger.info("internal.deactivate_account.success", account_id=str(account_id))
        return {"account_id": account.id, "is_active": account.is_active}
    except AccountNotFoundError as e:
        logger.warning("internal.deactivate_account.not_found", account_id=str(account_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/ban")
async def ban_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """
    Mark account as banned.
    
    Bans an account due to policy violations or administrative action.
    Banned accounts cannot access any platform services.
    
    Args:
        account_id: UUID of the account to ban
        account_service: Injected account service dependency
        
    Returns:
        Dictionary with account_id and is_banned status
        
    Raises:
        HTTPException: 404 if account not found
    """
    logger.warning("internal.ban_account", account_id=str(account_id))
    try:
        account = await account_service.ban_account(account_id)
        logger.warning("internal.ban_account.success", account_id=str(account_id))
        return {"account_id": account.id, "is_banned": account.is_banned}
    except AccountNotFoundError as e:
        logger.warning("internal.ban_account.not_found", account_id=str(account_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/unban")
async def unban_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """
    Reverse a ban.
    
    Removes a ban from an account, restoring access to platform services.
    Used when a ban was applied in error or after successful appeal.
    
    Args:
        account_id: UUID of the account to unban
        account_service: Injected account service dependency
        
    Returns:
        Dictionary with account_id and is_banned status
        
    Raises:
        HTTPException: 404 if account not found
    """
    logger.info("internal.unban_account", account_id=str(account_id))
    try:
        account = await account_service.unban_account(account_id)
        logger.info("internal.unban_account.success", account_id=str(account_id))
        return {"account_id": account.id, "is_banned": account.is_banned}
    except AccountNotFoundError as e:
        logger.warning("internal.unban_account.not_found", account_id=str(account_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
