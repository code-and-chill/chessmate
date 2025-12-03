"""Custom application exceptions."""

from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse


class ApplicationException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class GameNotFoundError(ApplicationException):
    """Game not found exception."""

    def __init__(self, game_id: str):
        super().__init__(
            message=f"Game {game_id} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="GAME_NOT_FOUND",
            details={"game_id": game_id},
        )


class GameStateError(ApplicationException):
    """Invalid game state exception."""

    def __init__(self, message: str, game_id: Optional[str] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_GAME_STATE",
            details={"game_id": game_id} if game_id else {},
        )


class InvalidMoveError(ApplicationException):
    """Invalid move exception."""

    def __init__(self, message: str, game_id: Optional[str] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="ILLEGAL_MOVE",
            details={"game_id": game_id} if game_id else {},
        )


class UnauthorizedError(ApplicationException):
    """Unauthorized access exception."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
        )


class GameAlreadyEndedError(ApplicationException):
    """Game already ended exception."""

    def __init__(self, game_id: str, reason: str):
        super().__init__(
            message=f"Game {game_id} has already ended: {reason}",
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="GAME_ALREADY_ENDED",
            details={"game_id": game_id, "reason": reason},
        )


class NotPlayersTurnError(ApplicationException):
    """Not player's turn exception."""

    def __init__(self, game_id: str):
        super().__init__(
            message=f"It is not your turn in game {game_id}",
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="NOT_PLAYERS_TURN",
            details={"game_id": game_id},
        )


class TakebackNotAllowedError(ApplicationException):
    """Takeback not allowed in rated games."""

    def __init__(self, game_id: str, reason: str = "Takebacks are not allowed in rated games"):
        super().__init__(
            message=reason,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="TAKEBACK_NOT_ALLOWED",
            details={"game_id": game_id},
        )


class BoardEditNotAllowedError(ApplicationException):
    """Board editing not allowed in rated games."""

    def __init__(self, game_id: str):
        super().__init__(
            message="Board editing is not allowed in rated games",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="BOARD_EDIT_NOT_ALLOWED",
            details={"game_id": game_id},
        )


class RatedStatusImmutableError(ApplicationException):
    """Rated status cannot be changed after game starts."""

    def __init__(self, game_id: str):
        super().__init__(
            message="Rated status cannot be changed once the game has started",
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="RATED_STATUS_IMMUTABLE",
            details={"game_id": game_id},
        )


def setup_exception_handlers(app: FastAPI) -> None:
    """Setup exception handlers for the application."""

    @app.exception_handler(ApplicationException)
    async def application_exception_handler(request, exc: ApplicationException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.error_code,
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            },
        )
