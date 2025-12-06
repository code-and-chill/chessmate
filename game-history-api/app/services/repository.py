from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from app.core.models import GameSummary


class GameHistoryRepository:
    def __init__(self) -> None:
        self._games: Dict[UUID, GameSummary] = {}
        self._player_index: Dict[UUID, List[UUID]] = {}

    def add_game(self, summary: GameSummary) -> GameSummary:
        self._games[summary.game_id] = summary
        for player_id in (summary.white_player_id, summary.black_player_id):
            if player_id not in self._player_index:
                self._player_index[player_id] = []
            self._player_index[player_id].append(summary.game_id)
        return summary

    def get_game(self, game_id: UUID) -> Optional[GameSummary]:
        return self._games.get(game_id)

    def list_games_for_player(self, player_id: UUID, limit: int = 20) -> List[GameSummary]:
        game_ids = self._player_index.get(player_id, [])
        games = [self._games[g_id] for g_id in game_ids]
        games.sort(key=lambda g: g.ended_at, reverse=True)
        return games[:limit]

    def games_count(self) -> int:
        return len(self._games)

    def most_recent_game_at(self) -> Optional[datetime]:
        if not self._games:
            return None
        return max(game.ended_at for game in self._games.values())

    def clear(self) -> None:
        self._games.clear()
        self._player_index.clear()
