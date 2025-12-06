---
title: Insights API Endpoints
service: insights-api
status: active
last_reviewed: 2025-12-07
type: api
---

# API

Base path: `/insights/v1`

## Health
- `GET /insights/v1/health`

## Player Overview
- `GET /insights/v1/players/{playerId}/overview`
- Query: `includeTimeControls`, `includeRecentWindow`
- Returns summary totals, per-time-control stats, and recent window snapshot.

## Performance Breakdown
- `GET /insights/v1/players/{playerId}/performance`
- Query: `timeControlBucket`, `window`, `mode`
- Returns per-bucket metrics plus color splits and streaks.

## Rating Trend
- `GET /insights/v1/players/{playerId}/rating-trend`
- Query: `timeControlBucket` (required), `from`, `to`, `maxPoints`
- Returns sampled rating points for charting.

## Recent Form
- `GET /insights/v1/players/{playerId}/recent-form`
- Query: `timeControlBucket`, `limit`
- Returns last N results with summary and streak.

## Admin Recompute
- `POST /insights/v1/admin/players/{playerId}/recompute`
- `POST /insights/v1/admin/recompute-range` (query: `from`, `to`)
- Schedules rebuild of aggregates from canonical sources.
