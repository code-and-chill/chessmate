from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse


class AccountNotFoundError(Exception):
    """Account not found error."""

    pass


class InvalidUsernameError(Exception):
    """Invalid username error."""

    pass


class AccountAlreadyExistsError(Exception):
    """Account already exists error."""

    pass


class UnauthorizedError(Exception):
    """Unauthorized access error."""

    pass


def setup_exception_handlers(app: FastAPI) -> None:
    """Setup exception handlers for the application."""

    @app.exception_handler(AccountNotFoundError)
    async def account_not_found_handler(request: Request, exc: AccountNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Account not found"},
        )

    @app.exception_handler(InvalidUsernameError)
    async def invalid_username_handler(request: Request, exc: InvalidUsernameError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Invalid username"},
        )

    @app.exception_handler(AccountAlreadyExistsError)
    async def account_already_exists_handler(request: Request, exc: AccountAlreadyExistsError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "Account already exists"},
        )

    @app.exception_handler(UnauthorizedError)
    async def unauthorized_handler(request: Request, exc: UnauthorizedError):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Unauthorized"},
        )
