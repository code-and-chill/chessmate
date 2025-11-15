"""JWT security and authentication."""
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from jwt import InvalidTokenError

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)


class JWTTokenData:
    """JWT token payload."""

    def __init__(
        self,
        user_id: str,
        tenant_id: str,
        sub: str,
        exp: int,
        iat: int,
    ) -> None:
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.sub = sub
        self.exp = exp
        self.iat = iat

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "JWTTokenData":
        """Create from token payload dictionary."""
        return cls(
            user_id=data.get("sub", data.get("user_id", "")),
            tenant_id=data.get("tenant_id", "t_default"),
            sub=data.get("sub", ""),
            exp=data.get("exp", 0),
            iat=data.get("iat", 0),
        )


def decode_token(token: str) -> JWTTokenData:
    """Decode and validate JWT token.

    Args:
        token: JWT token string

    Returns:
        JWTTokenData with user and tenant information

    Raises:
        UnauthorizedException: If token is invalid or expired
    """
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        token_data = JWTTokenData.from_dict(payload)

        # Validate token has required fields
        if not token_data.user_id:
            raise UnauthorizedException("Token missing user_id")

        return token_data

    except InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise UnauthorizedException(f"Invalid token: {str(e)}")


def create_token(user_id: str, tenant_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT token.

    Args:
        user_id: User identifier
        tenant_id: Tenant identifier
        expires_delta: Token expiration duration

    Returns:
        Encoded JWT token
    """
    settings = get_settings()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            seconds=settings.JWT_EXPIRATION_SECONDS
        )

    to_encode = {
        "sub": user_id,
        "user_id": user_id,
        "tenant_id": tenant_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return encoded_jwt
