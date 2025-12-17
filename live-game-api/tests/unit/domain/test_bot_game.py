"""Unit tests for bot game functionality."""
import pytest
from uuid import UUID, uuid4
from unittest.mock import AsyncMock, MagicMock

from app.domain.models.game import Game, GameStatus, TimeControl
from app.domain.models.decision_reason import DecisionReason
from app.domain.services.game_service import GameService
from app.infrastructure.clients.bot_orchestrator import BotOrchestratorClient, MoveResponse


@pytest.fixture
def mock_repository():
    """Mock game repository."""
    repo = AsyncMock()
    return repo


@pytest.fixture
def mock_bot_client():
    """Mock bot orchestrator client."""
    client = MagicMock(spec=BotOrchestratorClient)
    client.get_bot_move = AsyncMock()
    return client


@pytest.fixture
def game_service(mock_repository, mock_bot_client):
    """Create game service with mocked dependencies."""
    return GameService(mock_repository, bot_orchestrator_client=mock_bot_client)


@pytest.mark.asyncio
async def test_create_bot_game(game_service, mock_repository):
    """Test creating a bot game."""
    creator_id = uuid4()
    time_control = TimeControl(initial_seconds=300, increment_seconds=0)
    
    # Mock repository create
    created_game = Game(
        id=uuid4(),
        creator_account_id=creator_id,
        time_control=time_control,
        white_clock_ms=300000,
        black_clock_ms=300000,
        bot_id="bot-medium-1200",
        bot_color="b",
        rated=False,
        decision_reason=DecisionReason.BOT_GAME,
    )
    created_game.white_account_id = creator_id
    created_game.status = GameStatus.IN_PROGRESS
    created_game.started_at = None  # Will be set by start_game
    
    mock_repository.create = AsyncMock(return_value=created_game)
    
    # Create bot game
    result = await game_service.create_bot_game(
        creator_id=creator_id,
        difficulty="medium",
        player_color="white",
        time_control=time_control,
    )
    
    # Verify game was created with bot
    assert result.bot_id == "bot-medium-1200"
    assert result.bot_color == "b"
    assert result.rated is False
    assert result.decision_reason == DecisionReason.BOT_GAME
    assert mock_repository.create.called


@pytest.mark.asyncio
async def test_map_difficulty_to_bot_id(game_service):
    """Test difficulty to bot ID mapping."""
    assert game_service._map_difficulty_to_bot_id("beginner") == "bot-beginner-400"
    assert game_service._map_difficulty_to_bot_id("easy") == "bot-easy-800"
    assert game_service._map_difficulty_to_bot_id("medium") == "bot-medium-1200"
    assert game_service._map_difficulty_to_bot_id("hard") == "bot-hard-1600"
    assert game_service._map_difficulty_to_bot_id("expert") == "bot-expert-2000"
    assert game_service._map_difficulty_to_bot_id("master") == "bot-master-2400"
    # Default fallback
    assert game_service._map_difficulty_to_bot_id("unknown") == "bot-medium-1200"


@pytest.mark.asyncio
async def test_play_bot_move(game_service, mock_repository, mock_bot_client):
    """Test playing a bot move."""
    game_id = uuid4()
    creator_id = uuid4()
    
    # Create a bot game in progress
    game = Game(
        id=game_id,
        creator_account_id=creator_id,
        time_control=TimeControl(initial_seconds=300, increment_seconds=0),
        white_clock_ms=300000,
        black_clock_ms=300000,
        bot_id="bot-medium-1200",
        bot_color="b",
        status=GameStatus.IN_PROGRESS,
        side_to_move="b",  # Bot's turn
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
    )
    game.white_account_id = creator_id
    
    mock_repository.get_by_id = AsyncMock(return_value=game)
    mock_repository.update = AsyncMock(return_value=game)
    
    # Mock bot move response
    bot_response = MoveResponse(
        game_id=str(game_id),
        bot_id="bot-medium-1200",
        move="e7e5",  # Black pawn move
        thinking_time_ms=500,
    )
    mock_bot_client.get_bot_move = AsyncMock(return_value=bot_response)
    
    # Play bot move
    result = await game_service.play_bot_move(game_id)
    
    # Verify bot move was called
    assert mock_bot_client.get_bot_move.called
    assert mock_repository.update.called


@pytest.mark.asyncio
async def test_play_bot_move_not_bot_turn(game_service, mock_repository):
    """Test that play_bot_move fails if it's not bot's turn."""
    game_id = uuid4()
    creator_id = uuid4()
    
    game = Game(
        id=game_id,
        creator_account_id=creator_id,
        time_control=TimeControl(initial_seconds=300, increment_seconds=0),
        white_clock_ms=300000,
        black_clock_ms=300000,
        bot_id="bot-medium-1200",
        bot_color="b",
        status=GameStatus.IN_PROGRESS,
        side_to_move="w",  # Not bot's turn
    )
    
    mock_repository.get_by_id = AsyncMock(return_value=game)
    
    # Should raise error
    with pytest.raises(Exception):  # GameStateError
        await game_service.play_bot_move(game_id)

