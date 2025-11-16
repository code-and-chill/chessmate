"""
Public API routes for account management.

These endpoints provide user-facing account operations with proper
authentication and privacy controls.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_account_service, get_current_user_id
from app.core.logging import get_logger
from app.api.models import (
    CreateAccountRequest,
    FullAccountResponse,
    UpdateAccountRequest,
    UpdatePreferencesRequest,
    UpdatePrivacySettingsRequest,
    UpdateProfileDetailsRequest,
)
from app.core.exceptions import AccountNotFoundError, InvalidUsernameError
from app.domain.services.account_service import AccountService

router = APIRouter(prefix="/v1/accounts", tags=["accounts"])
logger = get_logger(__name__)


@router.get("/me", response_model=FullAccountResponse)
async def get_current_account(
    user_id: UUID = Depends(get_current_user_id),
    account_service: AccountService = Depends(get_account_service),
) -> FullAccountResponse:
    """Get current user's full account profile."""
    logger.debug("v1.get_current_account", user_id=str(user_id))
    try:
        account = await account_service.get_account_by_auth_user_id(user_id)
        account_data = await account_service.get_full_account(account.id)

        return FullAccountResponse(
            account=account_data["account"],
            profile_details=account_data["profile_details"],
            media=account_data["media"],
            preferences=account_data["preferences"],
            privacy_settings=account_data["privacy_settings"],
            social_counters=account_data["social_counters"],
        )
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/me", response_model=FullAccountResponse)
async def update_current_account(
    request: UpdateAccountRequest,
    user_id: UUID = Depends(get_current_user_id),
    account_service: AccountService = Depends(get_account_service),
) -> FullAccountResponse:
    """Update current user's account profile."""
    logger.info("v1.update_account", user_id=str(user_id))
    try:
        account = await account_service.get_account_by_auth_user_id(user_id)

        await account_service.update_account(
            account_id=account.id,
            display_name=request.display_name,
            country_code=request.country_code,
            language_code=request.language_code,
            time_zone=request.time_zone,
        )

        account_data = await account_service.get_full_account(account.id)

        return FullAccountResponse(
            account=account_data["account"],
            profile_details=account_data["profile_details"],
            media=account_data["media"],
            preferences=account_data["preferences"],
            privacy_settings=account_data["privacy_settings"],
            social_counters=account_data["social_counters"],
        )
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidUsernameError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/me/profile", response_model=dict)
async def update_profile_details(
    request: UpdateProfileDetailsRequest,
    user_id: UUID = Depends(get_current_user_id),
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Update current user's profile details."""
    logger.info("v1.update_profile", user_id=str(user_id))
    try:
        account = await account_service.get_account_by_auth_user_id(user_id)

        profile_details = await account_service.update_profile_details(
            account_id=account.id,
            bio=request.bio,
            location_text=request.location_text,
            website_url=request.website_url,
            youtube_url=request.youtube_url,
            twitch_url=request.twitch_url,
            twitter_url=request.twitter_url,
            other_link_url=request.other_link_url,
            favorite_players=request.favorite_players,
            favorite_openings=request.favorite_openings,
        )

        return profile_details.model_dump()
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/me/preferences", response_model=dict)
async def update_preferences(
    request: UpdatePreferencesRequest,
    user_id: UUID = Depends(get_current_user_id),
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Update current user's preferences."""
    logger.info("v1.update_preferences", user_id=str(user_id))
    try:
        account = await account_service.get_account_by_auth_user_id(user_id)

        preferences = await account_service.update_preferences(
            account_id=account.id,
            board_theme=request.board_theme,
            piece_set=request.piece_set,
            sound_enabled=request.sound_enabled,
            animation_level=request.animation_level,
            highlight_legal_moves=request.highlight_legal_moves,
            show_coordinates=request.show_coordinates,
            confirm_moves=request.confirm_moves,
            default_time_control=request.default_time_control,
            auto_queen_promotion=request.auto_queen_promotion,
        )

        return preferences.model_dump()
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/me/privacy", response_model=dict)
async def update_privacy(
    request: UpdatePrivacySettingsRequest,
    user_id: UUID = Depends(get_current_user_id),
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Update current user's privacy settings."""
    logger.info("v1.update_privacy", user_id=str(user_id))
    try:
        account = await account_service.get_account_by_auth_user_id(user_id)

        privacy_settings = await account_service.update_privacy_settings(
            account_id=account.id,
            show_ratings=request.show_ratings,
            show_online_status=request.show_online_status,
            show_game_archive=request.show_game_archive,
            allow_friend_requests=request.allow_friend_requests,
            allow_messages_from=request.allow_messages_from,
            allow_challenges_from=request.allow_challenges_from,
            is_profile_public=request.is_profile_public,
        )

        return privacy_settings.model_dump()
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{username}", response_model=dict)
async def get_public_profile(
    username: str,
    account_service: AccountService = Depends(get_account_service),
) -> dict:
    """Get public profile by username (respecting privacy settings)."""
    logger.debug("v1.get_public_profile", username=username)
    try:
        profile_data = await account_service.get_public_profile(username)

        return {
            "account": profile_data["account"].model_dump(),
            "profile_details": profile_data["profile_details"].model_dump(),
            "media": profile_data["media"].model_dump(),
            "social_counters": profile_data["social_counters"].model_dump(),
        }
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
