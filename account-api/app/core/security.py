"""
Security utilities for JWT token handling.

This module provides functions for creating and validating JWT tokens
used for authentication and authorization throughout the application.
"""

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.constants import ERROR_INVALID_CREDENTIALS
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


def verify_token(token: str) -> dict:
    """
    Verify JWT token and extract claims.
    
    Validates the JWT token signature and expiration, then extracts
    the claims payload.
    
    Args:
        token: JWT token string to verify
        
    Returns:
        Dictionary containing token claims (payload)
        
    Raises:
        HTTPException: If token is invalid, expired, or missing required claims
        
    Example:
        ```python
        payload = verify_token(token)
        user_id = payload.get("sub")
        ```
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            logger.warning("security.token.missing_subject")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS,
            )
        logger.debug("security.token.verified", user_id=user_id)
        return payload
    except JWTError as e:
        logger.warning("security.token.verification_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_INVALID_CREDENTIALS,
        )


def create_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create JWT token with specified claims.
    
    Generates a signed JWT token with the provided data and expiration time.
    
    Args:
        data: Dictionary of claims to include in the token
        expires_delta: Optional custom expiration time, defaults to JWT_EXPIRATION_HOURS
        
    Returns:
        Encoded JWT token string
        
    Example:
        ```python
        token = create_token({"sub": str(user_id), "email": user.email})
        ```
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    
    logger.debug("security.token.created", subject=data.get("sub"))
    return encoded_jwt
