---
title: Game History API Common Tasks
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: how-to
---

# Common Tasks

## Run database migrations
1. Ensure Postgres is reachable with the configured `POSTGRES_URL`.
2. Execute migrations: `make migrate` or `go run ./cmd/migrate`.
3. Verify new partitions are present for the current month/week.

## Replay a game from Kafka/S3
1. Call `POST /game-history/v1/admin/games/{gameId}/rebuild` with admin credentials.
2. Monitor logs for ingestion progress and idempotency skips.
3. Validate `games` and `player_games` rows for the target game.

## Export a date range for analytics
1. Invoke `GET /game-history/v1/export/games?from=<ISO>&to=<ISO>&region=<region>`.
2. For large ranges, follow presigned S3 link and deliver NDJSON/Parquet to downstream analysts.
3. Capture audit logs for the export request.
