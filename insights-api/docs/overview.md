---
title: Insights API Overview
service: insights-api
status: active
last_reviewed: 2025-12-07
type: overview
---

# Insights API Overview

`insights-api` precomputes and serves chess player insights such as winrates, streaks, and rating trends so client experiences stay fast without scanning raw game data.

## Scope
- Aggregate game results by time control, mode, and color.
- Serve player overviews, performance breakdowns, trends, and recent form via REST.
- Provide admin recompute hooks for patching aggregates.

## Out of Scope
- Raw game storage (handled by `game-history-api`).
- Rating computation (handled by `rating-api`).
- Anti-cheat scoring or deep engine metrics.

## Key Dependencies
- Consumes summaries from `game-history-api` and rating updates from `rating-api`.
- Stores aggregates in Postgres and ingests via Kafka in production.
- Exposes REST endpoints for web and mobile surfaces.
