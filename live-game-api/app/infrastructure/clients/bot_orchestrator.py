"""Bot orchestrator API client."""
import os
from typing import Optional
import httpx
from pydantic import BaseModel

from app.core.exceptions import ApplicationException


class BotMoveError(ApplicationException):
    """Error when bot move generation fails."""
    status_code = 500
    message = "Failed to generate bot move"


class BotNotConfiguredError(ApplicationException):
    """Error when bot_id is invalid or not configured."""
    status_code = 400
    message = "Bot not configured"


class Clocks(BaseModel):
    """Clock state for both players."""
    white_ms: int
    black_ms: int
    increment_ms: int = 0


class MoveRequest(BaseModel):
    """Request to calculate a bot move."""
    game_id: str
    bot_color: str  # 'w' or 'b'
    fen: str
    move_number: int
    clocks: Clocks
    metadata: dict = {}
    debug: bool = False


class MoveResponse(BaseModel):
    """Response with selected bot move."""
    game_id: str
    bot_id: str
    move: str  # UCI format (e.g., "e2e4")
    thinking_time_ms: int
    debug_info: Optional[dict] = None


class BotOrchestratorClient:
    """HTTP client for bot-orchestrator-api."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv(
            "BOT_ORCHESTRATOR_API_URL", "http://localhost:8006"
        )
        self.timeout = 30.0  # 30 seconds timeout for bot moves

    async def get_bot_move(
        self,
        bot_id: str,
        game_id: str,
        fen: str,
        bot_color: str,
        move_number: int,
        white_clock_ms: int,
        black_clock_ms: int,
        increment_ms: int = 0,
        metadata: dict = None,
        debug: bool = False,
    ) -> MoveResponse:
        """Get a bot move from the orchestrator API.
        
        Args:
            bot_id: Bot identifier (e.g., "bot-beginner-400")
            game_id: Game ID
            fen: Current FEN position
            bot_color: Bot's color ('w' or 'b')
            move_number: Current move number
            white_clock_ms: White player's remaining time in ms
            black_clock_ms: Black player's remaining time in ms
            increment_ms: Time increment per move in ms
            metadata: Optional metadata dict
            debug: Whether to include debug info
            
        Returns:
            MoveResponse with the selected move
            
        Raises:
            BotMoveError: If the API call fails
            BotNotConfiguredError: If bot_id is invalid
        """
        url = f"{self.base_url}/v1/bots/{bot_id}/move"
        
        request_data = {
            "game_id": str(game_id),
            "bot_color": bot_color,
            "fen": fen,
            "move_number": move_number,
            "clocks": {
                "white_ms": white_clock_ms,
                "black_ms": black_clock_ms,
                "increment_ms": increment_ms,
            },
            "metadata": metadata or {},
            "debug": debug,
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=request_data,
                )
                
                if response.status_code == 404:
                    raise BotNotConfiguredError(
                        f"Bot {bot_id} not found or not configured"
                    )
                
                if response.status_code != 200:
                    raise BotMoveError(
                        f"Bot orchestrator API error: {response.status_code} {response.text}"
                    )
                
                data = response.json()
                return MoveResponse(**data)
                
        except httpx.TimeoutException:
            raise BotMoveError("Bot move request timed out")
        except httpx.RequestError as e:
            raise BotMoveError(f"Failed to connect to bot orchestrator: {str(e)}")
        except Exception as e:
            raise BotMoveError(f"Unexpected error getting bot move: {str(e)}")
