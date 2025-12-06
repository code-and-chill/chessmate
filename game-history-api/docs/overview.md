---
title: Game History API Overview
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: overview
---

# Game History API Overview

## Purpose

`game-history-api` provides the canonical interface for recording and retrieving chess game summaries. It exposes write endpoints for finalized games and read endpoints for replaying player activity so downstream services (rating-api, insights-api) never need to scan raw move data.

## Scope

### In Scope
- Accept summary-level game payloads with player identities, outcomes, and time-control metadata.
- Serve query-ready game summaries for individual players and by game id.
- Maintain recency metadata to help freshness monitors and backfill tooling.
- Provide health and admin surfaces consistent with other APIs in the platform.

### Out of Scope
- Live move streaming or validation (handled by live-game-api).
- Rating calculations (handled by rating-api).
- Advanced analytics or aggregations (handled by insights-api).
- Anti-cheat signals or adjudication.

## Key Dependencies

### Upstream
- `live-game-api` supplies authoritative game completion events.
- `rating-api` supplies rating adjustments that can be co-located with summaries when needed.

### Downstream
- `rating-api` consumes summaries to update player ratings.
- `insights-api` consumes summaries to build aggregates and trends.
- Internal tools that need per-player game history views.

## Key Flows
- Record a completed game with mode, time control, result, and participants.
- Fetch a single game by id for auditing or replay surfaces.
- Fetch the most recent games for a player to power activity feeds and downstream pipelines.
