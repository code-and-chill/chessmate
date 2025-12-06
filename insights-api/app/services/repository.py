from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from app.core.models import (
    ColorBreakdown,
    Mode,
    PlayerOverviewResponse,
    PerformanceResponse,
    PlayerSummary,
    PlayerTimeControlStats,
    RatingPoint,
    RatingTrendResponse,
    RecentFormResponse,
    RecentFormSummary,
    RecentResult,
    RecentWindowSummary,
    Streak,
    StreakType,
    TimeControlBucket,
)


class InsightsRepository:
    def __init__(self) -> None:
        self._timecontrol_stats: Dict[Tuple[str, TimeControlBucket], PlayerTimeControlStats] = {}
        self._recent_games: Dict[str, List[RecentResult]] = {}
        self._rating_points: Dict[Tuple[str, TimeControlBucket], List[RatingPoint]] = {}
        self._seed()

    def _seed(self) -> None:
        generated_at = datetime(2025, 12, 6, 10, 15)
        tc = TimeControlBucket.BLITZ
        self._timecontrol_stats[("player-123", tc)] = PlayerTimeControlStats(
            timeControlBucket=tc,
            gamesPlayed=900,
            wins=500,
            losses=360,
            draws=40,
            aborts=0,
            winrate=0.556,
            lastGameAt=datetime(2025, 12, 6, 9, 50),
            currentStreak=Streak(type=StreakType.WIN, length=2),
            bestWinStreak=8,
            bestLossStreak=5,
            avgMoves=36.2,
            currentRating=1850,
        )

        self._recent_games["player-123"] = [
            RecentResult(gameId="g1", endedAt=datetime(2025, 12, 6, 9, 50), result="WIN"),
            RecentResult(gameId="g2", endedAt=datetime(2025, 12, 6, 9, 45), result="LOSS"),
        ]

        self._rating_points[("player-123", tc)] = [
            RatingPoint(timestamp=datetime(2025, 10, 5, 12), rating=1720),
            RatingPoint(timestamp=datetime(2025, 11, 10, 12), rating=1800),
            RatingPoint(timestamp=datetime(2025, 12, 6, 10, 15), rating=1850),
        ]
        self._generated_at = generated_at

    def get_overview(self, player_id: str, include_time_controls: bool = True, include_recent_window: bool = True) -> PlayerOverviewResponse:
        stats = [s for (pid, _), s in self._timecontrol_stats.items() if pid == player_id]
        total_games = sum(s.gamesPlayed for s in stats)
        total_wins = sum(s.wins for s in stats)
        total_losses = sum(s.losses for s in stats)
        total_draws = sum(s.draws for s in stats)

        summary = PlayerSummary(
            totalGames=total_games,
            totalWins=total_wins,
            totalLosses=total_losses,
            totalDraws=total_draws,
            winrate=(total_wins / total_games) if total_games else 0.0,
            currentGlobalStreak=stats[0].currentStreak if stats else None,
        )

        recent_window = None
        if include_recent_window and stats:
            since = datetime(2025, 11, 6)
            until = datetime(2025, 12, 6)
            wins = sum(1 for g in self._recent_games.get(player_id, []) if g.result == "WIN")
            losses = sum(1 for g in self._recent_games.get(player_id, []) if g.result == "LOSS")
            draws = sum(1 for g in self._recent_games.get(player_id, []) if g.result == "DRAW")
            games_played = wins + losses + draws
            recent_window = RecentWindowSummary(
                window="30D",
                since=since,
                until=until,
                gamesPlayed=games_played,
                wins=wins,
                losses=losses,
                draws=draws,
                winrate=(wins / games_played) if games_played else 0.0,
            )

        return PlayerOverviewResponse(
            playerId=player_id,
            generatedAt=self._generated_at,
            summary=summary,
            byTimeControl=stats if include_time_controls else [],
            recentWindow=recent_window,
        )

    def get_performance(
        self,
        player_id: str,
        time_control: Optional[TimeControlBucket],
        window: str,
        mode: Optional[Mode],
    ) -> Optional[PerformanceResponse]:
        stats = [s for (pid, tc), s in self._timecontrol_stats.items() if pid == player_id and (time_control is None or tc == time_control)]
        if not stats:
            return None
        target = stats[0]
        since = datetime(2025, 11, 6)
        until = datetime(2025, 12, 6)
        by_color = {
            "WHITE": ColorBreakdown(gamesPlayed=target.gamesPlayed // 2, wins=target.wins // 2, losses=target.losses // 2, draws=target.draws // 2, winrate=0.667),
            "BLACK": ColorBreakdown(gamesPlayed=target.gamesPlayed - target.gamesPlayed // 2, wins=target.wins - target.wins // 2, losses=target.losses - target.losses // 2, draws=target.draws - target.draws // 2, winrate=0.5),
        }
        return PerformanceResponse(
            playerId=player_id,
            timeControlBucket=time_control or target.timeControlBucket,
            window=window,
            since=since,
            until=until,
            gamesPlayed=target.gamesPlayed,
            wins=target.wins,
            losses=target.losses,
            draws=target.draws,
            winrate=target.winrate,
            byColor=by_color,
            streaks={
                "currentStreak": target.currentStreak or Streak(type=StreakType.NONE, length=0),
                "bestWinStreak": Streak(type=StreakType.WIN, length=target.bestWinStreak),
                "bestLossStreak": Streak(type=StreakType.LOSS, length=target.bestLossStreak),
            },
        )

    def get_rating_trend(
        self, player_id: str, time_control: TimeControlBucket, start: Optional[datetime], end: Optional[datetime], max_points: int
    ) -> Optional[RatingTrendResponse]:
        points = self._rating_points.get((player_id, time_control), [])
        filtered = [p for p in points if (start is None or p.timestamp >= start) and (end is None or p.timestamp <= end)]
        filtered = filtered[:max_points]
        if not filtered:
            return None
        return RatingTrendResponse(playerId=player_id, timeControlBucket=time_control, from_=start, to=end, points=filtered)

    def get_recent_form(self, player_id: str, time_control: Optional[TimeControlBucket], limit: int) -> Optional[RecentFormResponse]:
        results = self._recent_games.get(player_id, [])[:limit]
        if not results:
            return None
        wins = sum(1 for r in results if r.result == "WIN")
        losses = sum(1 for r in results if r.result == "LOSS")
        draws = sum(1 for r in results if r.result == "DRAW")
        current_streak = Streak(type=StreakType.WIN, length=2)
        summary = RecentFormSummary(
            wins=wins,
            losses=losses,
            draws=draws,
            winrate=(wins / len(results)) if results else 0.0,
            currentStreak=current_streak,
        )
        return RecentFormResponse(
            playerId=player_id,
            timeControlBucket=time_control,
            limit=limit,
            results=results,
            summary=summary,
        )

    def health(self) -> Dict[str, str]:
        return {
            "status": "ok",
            "postgres": "up",
            "kafka": "up",
            "processedThrough": self._generated_at.isoformat(),
        }

    def recompute_player(self, player_id: str) -> Dict[str, str]:
        return {"status": "scheduled", "playerId": player_id}

    def recompute_range(self, start: datetime, end: datetime) -> Dict[str, str]:
        return {"status": "scheduled", "from": start.isoformat(), "to": end.isoformat()}
