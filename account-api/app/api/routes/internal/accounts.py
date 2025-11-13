from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_account_service
from app.api.models import CreateAccountRequest
from app.core.exceptions import (
    AccountAlreadyExistsError,
    AccountNotFoundError,
    UnauthorizedError,
)
from app.domain.services.account_service import AccountService

router = APIRouter(prefix="/internal/accounts", tags=["internal"])


@router.post("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "account-api"}


@router.post("")
async def create_account(
    request: CreateAccountRequest,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Create account for a newly-created auth user."""
    try:
        account = await account_service.create_account(
            auth_user_id=request.auth_user_id,
            username=request.username,
            display_name=request.display_name,
            country_code=request.country_code,
            language_code=request.language_code,
            time_zone=request.time_zone,
        )

        return {"account_id": account.id, "username": account.username}
    except AccountAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/{account_id}")
async def get_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Fetch full account record by ID (service-to-service only)."""
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/by-auth-user/{auth_user_id}")
async def get_account_by_auth_user(
    auth_user_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Resolve account by auth_user_id."""
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/deactivate")
async def deactivate_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Deactivate an account (admin/service-only)."""
    try:
        account = await account_service.deactivate_account(account_id)

        return {"account_id": account.id, "is_active": account.is_active}
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/ban")
async def ban_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Mark account as banned."""
    try:
        account = await account_service.ban_account(account_id)

        return {"account_id": account.id, "is_banned": account.is_banned}
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/unban")
async def unban_account(
    account_id: UUID,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Reverse a ban."""
    try:
        account = await account_service.unban_account(account_id)

        return {"account_id": account.id, "is_banned": account.is_banned}
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
