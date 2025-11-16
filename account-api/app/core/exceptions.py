from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


class AccountNotFoundError(Exception):
    """
    Raised when an account cannot be found.
    
    This exception is raised when searching for an account by ID, username,
    or auth_user_id and no matching account exists in the database.
    """

    def __init__(self, message: str = "Account not found"):
        self.message = message
        super().__init__(self.message)


class InvalidUsernameError(Exception):
    """
    Raised when a username fails validation.
    
    This exception is raised when a username doesn't meet the requirements:
    - Length between 3-32 characters
    - Contains only alphanumeric characters, underscores, and hyphens
    """

    def __init__(self, message: str = "Invalid username"):
        self.message = message
        super().__init__(self.message)


class AccountAlreadyExistsError(Exception):
    """
    Raised when attempting to create a duplicate account.
    
    This exception is raised when trying to create an account with a username
    or auth_user_id that already exists in the system.
    """

    def __init__(self, message: str = "Account already exists"):
        self.message = message
        super().__init__(self.message)


class UnauthorizedError(Exception):
    """
    Raised when a user attempts unauthorized access.
    
    This exception is raised when a user tries to access resources they
    don't have permission to view or modify.
    """

    def __init__(self, message: str = "Unauthorized access"):
        self.message = message
        super().__init__(self.message)


def setup_exception_handlers(app: FastAPI) -> None:
    """
    Setup exception handlers for the FastAPI application.
    
    Registers custom exception handlers that convert domain exceptions
    into appropriate HTTP responses with proper status codes and logging.
    
    Args:
        app: FastAPI application instance
    """

    @app.exception_handler(AccountNotFoundError)
    async def account_not_found_handler(
        request: Request, exc: AccountNotFoundError
    ) -> JSONResponse:
        """
        Handle AccountNotFoundError exceptions.
        
        Args:
            request: FastAPI request object
            exc: The AccountNotFoundError exception
            
        Returns:
            JSONResponse with 404 status code
        """
        logger.warning(
            "account.not_found",
            path=request.url.path,
            method=request.method,
            message=exc.message,
        )
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.message},
        )

    @app.exception_handler(InvalidUsernameError)
    async def invalid_username_handler(
        request: Request, exc: InvalidUsernameError
    ) -> JSONResponse:
        """
        Handle InvalidUsernameError exceptions.
        
        Args:
            request: FastAPI request object
            exc: The InvalidUsernameError exception
            
        Returns:
            JSONResponse with 400 status code
        """
        logger.warning(
            "account.invalid_username",
            path=request.url.path,
            method=request.method,
            message=exc.message,
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message},
        )

    @app.exception_handler(AccountAlreadyExistsError)
    async def account_already_exists_handler(
        request: Request, exc: AccountAlreadyExistsError
    ) -> JSONResponse:
        """
        Handle AccountAlreadyExistsError exceptions.
        
        Args:
            request: FastAPI request object
            exc: The AccountAlreadyExistsError exception
            
        Returns:
            JSONResponse with 409 status code
        """
        logger.warning(
            "account.already_exists",
            path=request.url.path,
            method=request.method,
            message=exc.message,
        )
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": exc.message},
        )

    @app.exception_handler(UnauthorizedError)
    async def unauthorized_handler(
        request: Request, exc: UnauthorizedError
    ) -> JSONResponse:
        """
        Handle UnauthorizedError exceptions.
        
        Args:
            request: FastAPI request object
            exc: The UnauthorizedError exception
            
        Returns:
            JSONResponse with 403 status code
        """
        logger.warning(
            "account.unauthorized",
            path=request.url.path,
            method=request.method,
            message=exc.message,
        )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": exc.message},
        )
