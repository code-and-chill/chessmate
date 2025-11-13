"""Game domain model tests."""

from uuid import uuid4

import pytest

from app.domain.models.game import (
    Game,
    GameResult,
    GameStatus,
    EndReason,
    TimeControl,
)


class TestGame:
    """Test game domain model."""

    def test_create_game(self):
        """Test creating a game."""
        creator_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        assert game.creator_account_id == creator_id
        assert game.status == GameStatus.WAITING_FOR_OPPONENT
        assert game.rated is True
        assert game.white_account_id is None
        assert game.black_account_id is None
        assert game.result is None

    def test_assign_colors_white(self):
        """Test assigning white to creator."""
        creator_id = uuid4()
        opponent_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        game.assign_colors(opponent_id, "white")

        assert game.white_account_id == creator_id
        assert game.black_account_id == opponent_id

    def test_assign_colors_black(self):
        """Test assigning black to creator."""
        creator_id = uuid4()
        opponent_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        game.assign_colors(opponent_id, "black")

        assert game.white_account_id == opponent_id
        assert game.black_account_id == creator_id

    def test_start_game(self):
        """Test starting a game."""
        creator_id = uuid4()
        opponent_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        game.assign_colors(opponent_id, "white")
        game.start_game()

        assert game.status == GameStatus.IN_PROGRESS
        assert game.started_at is not None
        assert game.side_to_move == "w"

    def test_end_game(self):
        """Test ending a game."""
        creator_id = uuid4()
        opponent_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        game.assign_colors(opponent_id, "white")
        game.start_game()
        game.end_game(GameResult.WHITE_WIN, EndReason.CHECKMATE)

        assert game.status == GameStatus.ENDED
        assert game.result == GameResult.WHITE_WIN
        assert game.end_reason == EndReason.CHECKMATE
        assert game.ended_at is not None

    def test_get_player_by_id(self):
        """Test getting player color by ID."""
        creator_id = uuid4()
        opponent_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        game.assign_colors(opponent_id, "white")

        assert game.get_player_by_id(creator_id) == "w"
        assert game.get_player_by_id(opponent_id) == "b"
        assert game.get_player_by_id(uuid4()) is None

    def test_is_player_in_game(self):
        """Test checking if player is in game."""
        creator_id = uuid4()
        opponent_id = uuid4()
        outsider_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        game.assign_colors(opponent_id, "white")

        assert game.is_player_in_game(creator_id) is True
        assert game.is_player_in_game(opponent_id) is True
        assert game.is_player_in_game(outsider_id) is False

    def test_can_join(self):
        """Test checking if a player can join."""
        creator_id = uuid4()
        opponent_id = uuid4()
        outsider_id = uuid4()
        time_control = TimeControl(initial_seconds=300, increment_seconds=0)

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=300000,
            black_clock_ms=300000,
        )

        # Game is waiting for opponent, outsider can join
        assert game.can_join(outsider_id) is True
        assert game.can_join(creator_id) is False  # Creator cannot join own game

        # After assignment, game is not in waiting state
        game.assign_colors(opponent_id, "white")
        assert game.can_join(outsider_id) is False
