"""Database ORM models re-exports for backward compatibility."""
from .game_move_orm import GameMoveORM
from .game_orm import GameORM

__all__ = ["GameORM", "GameMoveORM"]
