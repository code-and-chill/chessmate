"""Game domain service."""

import asyncio
from typing import List, Optional
from uuid import UUID

from app.core.exceptions import (
    GameAlreadyEndedError,
    GameNotFoundError,
    GameStateError,
    InvalidMoveError,
    NotPlayersTurnError,
)
from app.domain.models.game import (
    EndReason,
    Game,
    GameCreatedEvent,
    GameEndedEvent,
    GameResult,
    GameStartedEvent,
    Move,
    MovePlayedEvent,
    TimeControl,
)
from app.domain.repositories.game_repository import GameRepositoryInterface


class GameService:
    """Game domain service."""

    def __init__(self, repository: GameRepositoryInterface):
        self.repository = repository
        self.events: List = []

    async def create_challenge(
        self,
        creator_id: UUID,
        time_control: TimeControl,
        opponent_account_id: Optional[UUID] = None,
        color_preference: str = "random",
        rated: bool = True,
    ) -> Game:
        """Create a new game challenge."""

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=time_control.initial_seconds * 1000,
            black_clock_ms=time_control.initial_seconds * 1000,
            rated=rated,
        )

        # If opponent specified, assign colors now
        if opponent_account_id:
            game.assign_colors(opponent_account_id, color_preference)

        # Save game
        saved_game = await self.repository.create(game)

        # Emit event
        self.events.append(
            GameCreatedEvent(
                aggregate_id=saved_game.id,
                creator_account_id=creator_id,
                time_control=time_control,
                rated=rated,
            )
        )

        return saved_game

    async def join_game(
        self, game_id: UUID, opponent_id: UUID, color_preference: str = "random"
    ) -> Game:
        """Join an existing game challenge."""

        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if not game.can_join(opponent_id):
            raise GameStateError(
                "Cannot join this game - it is not waiting for opponent or you are already in it",
                str(game_id),
            )

        # Assign colors
        game.assign_colors(opponent_id, color_preference)

        # Start the game
        game.start_game()

        # Save updated game
        saved_game = await self.repository.update(game)

        # Emit events
        self.events.append(
            GameStartedEvent(
                aggregate_id=saved_game.id,
                white_account_id=saved_game.white_account_id,
                black_account_id=saved_game.black_account_id,
                started_at=saved_game.started_at,
            )
        )

        return saved_game

    async def play_move(
        self,
        game_id: UUID,
        player_id: UUID,
        from_square: str,
        to_square: str,
        promotion: Optional[str] = None,
    ) -> Game:
        """Play a move in an active game."""

        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if not game.is_in_progress():
            raise GameStateError(
                f"Game is not in progress (status: {game.status})", str(game_id)
            )

        # Verify it's this player's turn
        player_color = game.get_player_by_id(player_id)
        if not player_color:
            raise GameStateError("You are not a player in this game", str(game_id))

        if game.side_to_move != player_color:
            raise NotPlayersTurnError(str(game_id))

        # TODO: Validate move using chess engine
        # For MVP, we'll accept moves as-is and trust client validation
        # This should be replaced with proper move validation

        # Create move object
        ply = len(game.moves) + 1
        move_number = (ply + 1) // 2

        move = Move(
            ply=ply,
            move_number=move_number,
            color=player_color,
            from_square=from_square,
            to_square=to_square,
            promotion=promotion,
            san=f"{from_square}{to_square}",  # Simplified SAN
            fen_after=game.fen,  # TODO: Calculate new FEN
            elapsed_ms=0,  # TODO: Calculate from clock
        )

        # Add move to game
        game.add_move(move)

        # Switch sides
        game.side_to_move = "b" if game.side_to_move == "w" else "w"

        # Update clocks
        # TODO: Implement proper clock updates

        # Save updated game
        saved_game = await self.repository.update(game)

        # Emit event
        self.events.append(
            MovePlayedEvent(
                aggregate_id=saved_game.id, move=move, fen=saved_game.fen
            )
        )

        return saved_game

    async def resign(self, game_id: UUID, player_id: UUID) -> Game:
        """Player resigns from the game."""

        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if game.is_ended():
            raise GameAlreadyEndedError(str(game_id), str(game.end_reason))

        # Verify player is in game
        player_color = game.get_player_by_id(player_id)
        if not player_color:
            raise GameStateError("You are not a player in this game", str(game_id))

        # Determine winner
        if player_color == "w":
            result = GameResult.BLACK_WIN
        else:
            result = GameResult.WHITE_WIN

        # End game
        game.end_game(result, EndReason.RESIGNATION)

        # Save updated game
        saved_game = await self.repository.update(game)

        # Emit event
        self.events.append(
            GameEndedEvent(
                aggregate_id=saved_game.id,
                white_account_id=saved_game.white_account_id,
                black_account_id=saved_game.black_account_id,
                result=result,
                end_reason=EndReason.RESIGNATION,
                time_control=saved_game.time_control,
                rated=saved_game.rated,
            )
        )

        return saved_game

    def get_pending_events(self) -> List:
        """Get pending domain events."""
        return self.events.copy()

    def clear_pending_events(self) -> None:
        """Clear pending events after publishing."""
        self.events.clear()
