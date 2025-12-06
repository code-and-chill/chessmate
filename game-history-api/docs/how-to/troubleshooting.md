---
title: Game History API Troubleshooting
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: how-to
---

# Troubleshooting

## Kafka backlog grows
- Verify brokers are reachable and consumer group `game-history-api-ingestors` is active.
- Temporarily pause ingestion flushes if Postgres is constrained; replay after recovery.

## Duplicate or missing moves in summaries
- Confirm idempotency table or last `moveNumber` tracking is applied during replays.
- Rebuild affected games via `POST /game-history/v1/admin/games/{gameId}/rebuild` to resynchronize state.

## Slow player history queries
- Check partition pruning on `player_games` by `ended_at` and ensure indexes are healthy.
- Add cache layer for hot players and validate query filters (`mode`, `timeControl`, `result`) are supported by indexes.

## Archival failures to S3
- Inspect S3 credentials and bucket paths (`region`, `dt`, `hour` prefixes).
- Retry failed batches and verify manifest completeness before marking partitions archived.
