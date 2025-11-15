"""Exception definitions and handlers."""
from typing import Any

from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class MatchmakingException(Exception):
    """Base exception for matchmaking domain."""

    def __init__(self, message: str, code: str) -> None:
        self.message = message
        self.code = code
        super().__init__(message)


class InvalidRequestException(MatchmakingException):
    """Invalid request parameters."""

    def __init__(self, message: str) -> None:
        super().__init__(message, "INVALID_REQUEST")


class AlreadyInQueueException(MatchmakingException):
    """User already in queue."""

    def __init__(self, message: str = "User already in queue") -> None:
        super().__init__(message, "ALREADY_IN_QUEUE")


class ActiveGameExistsException(MatchmakingException):
    """User has active game."""

    def __init__(self, message: str = "User has active game") -> None:
        super().__init__(message, "ACTIVE_GAME_EXISTS")


class MatchmakingUnavailableException(MatchmakingException):
    """Matchmaking service unavailable."""

    def __init__(self, message: str = "Matchmaking unavailable") -> None:
        super().__init__(message, "MATCHMAKING_UNAVAILABLE")


class QueueEntryNotFoundException(MatchmakingException):
    """Queue entry not found."""

    def __init__(self, message: str = "Queue entry not found") -> None:
        super().__init__(message, "NOT_FOUND")


class CannotCancelException(MatchmakingException):
    """Cannot cancel queue entry."""

    def __init__(self, message: str = "Cannot cancel queue entry") -> None:
        super().__init__(message, "CANNOT_CANCEL")


class ChallengeNotFoundException(MatchmakingException):
    """Challenge not found."""

    def __init__(self, message: str = "Challenge not found") -> None:
        super().__init__(message, "NOT_FOUND")


class InvalidChallengeStateException(MatchmakingException):
    """Invalid challenge state."""

    def __init__(self, message: str = "Invalid challenge state") -> None:
        super().__init__(message, "INVALID_STATE")


class CannotAcceptChallengeException(MatchmakingException):
    """Cannot accept challenge."""

    def __init__(self, message: str = "Cannot accept challenge") -> None:
        super().__init__(message, "CANNOT_ACCEPT")


class UnauthorizedException(MatchmakingException):
    """User not authorized."""

    def __init__(self, message: str = "Not authorized") -> None:
        super().__init__(message, "UNAUTHORIZED")


def setup_exception_handlers(app: FastAPI) -> None:
    """Setup exception handlers for FastAPI app."""

    @app.exception_handler(InvalidRequestException)
    async def invalid_request_handler(
        request: Any, exc: InvalidRequestException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(AlreadyInQueueException)
    async def already_in_queue_handler(
        request: Any, exc: AlreadyInQueueException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(ActiveGameExistsException)
    async def active_game_exists_handler(
        request: Any, exc: ActiveGameExistsException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(MatchmakingUnavailableException)
    async def matchmaking_unavailable_handler(
        request: Any, exc: MatchmakingUnavailableException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(QueueEntryNotFoundException)
    async def queue_entry_not_found_handler(
        request: Any, exc: QueueEntryNotFoundException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(CannotCancelException)
    async def cannot_cancel_handler(
        request: Any, exc: CannotCancelException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(ChallengeNotFoundException)
    async def challenge_not_found_handler(
        request: Any, exc: ChallengeNotFoundException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(InvalidChallengeStateException)
    async def invalid_challenge_state_handler(
        request: Any, exc: InvalidChallengeStateException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(CannotAcceptChallengeException)
    async def cannot_accept_challenge_handler(
        request: Any, exc: CannotAcceptChallengeException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(UnauthorizedException)
    async def unauthorized_handler(
        request: Any, exc: UnauthorizedException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Any, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": exc.errors(),
            },
        )
