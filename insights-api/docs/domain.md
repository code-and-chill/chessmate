---
title: Insights API Domain
service: insights-api
status: active
last_reviewed: 2025-12-07
type: domain
---

# Domain

`insights-api` centers on player-level aggregates.

## Core Objects
- **PlayerTimeControlStats**: Counts, winrate, streaks, average moves, and current rating per bucket.
- **PlayerTimeWindowStats**: Windowed metrics for recent form slices such as 24H, 7D, 30D, and 90D.
- **PlayerRatingTimeline**: Sampled rating points for charting.

## Invariants
- Streaks reset when the result type changes; draws pause but do not extend streaks.
- Winrate calculations guard against division by zero.
- Rating trend points remain ordered by timestamp.

## Inputs
- `game-completed-events` from `game-history-api`.
- Optional `rating-events` for rating-only adjustments.
