---
title: Game History Common Tasks
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: how-to
---

# Game History Common Tasks

## Reset repository state
- Restart the service or call an admin reset endpoint (to be added) to clear in-memory data.

## Seed sample games
- Use the `POST /api/v1/games` endpoint with fixture payloads to populate local data for UI testing.

## Retrieve latest game for a player
- Request `GET /api/v1/players/{playerId}/games?limit=1` to get the newest game summary.

## Check most recent ingest time
- Use the health endpoint and future metrics to verify the most recent `endedAt` timestamp processed.
