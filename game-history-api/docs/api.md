---
title: Game History API Reference
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: api
---

# Game History API Reference

## Public Endpoints
- `GET /game-history/v1/games/{gameId}`: Retrieve canonical game summary including move list and metadata.
- `GET /game-history/v1/players/{playerId}/games`: Paginated player history with filters for mode, time control, result, since/until.

## Internal Endpoints
- `GET /game-history/v1/export/games`: Bulk export between time ranges with optional filters (mode, time control, rating bounds, region, limit); may stream NDJSON or return presigned S3 URLs.
- `POST /game-history/v1/admin/games/{gameId}/rebuild`: Rebuild canonical records from Kafka/S3 event stream (internal only).
- `GET /game-history/v1/health`: Health/readiness including Postgres and Kafka connectivity.

## Request/Response Schemas
### `GET /game-history/v1/games/{gameId}`
- **Path params**: `gameId` (UUID/snowflake)
- **Response 200**: Game metadata (players, ratings pre/post, time control, variant, mode, region/platform, client version, start/end timestamps, result/termination) and `moves` array with move number, side, SAN/UCI, timestamps, and clocks.
- **Errors**: 404 when missing; 410 if only archived to cold storage (optional).

### `GET /game-history/v1/players/{playerId}/games`
- **Query params**: `cursor`, `limit<=100`, `mode`, `timeControl`, `result`, `since`, `until`.
- **Response 200**: Player game slices with role, endedAt, mode, timeControl, result (win/loss/draw), opponent id and ratings, and `nextCursor`.

### `GET /game-history/v1/export/games`
- **Query params**: `from`, `to` (ISO timestamps, required), optional filters (`mode`, `timeControl`, `minRating`, `maxRating`, `region`, `limit`).
- **Response**: Streamed NDJSON/paginated JSON or redirect/presigned URL for S3 batch export.

### `POST /game-history/v1/admin/games/{gameId}/rebuild`
- **Purpose**: Trigger replay from Kafka/S3 to rebuild game and player index rows.
- **Auth**: Internal/admin authorization required.

### `GET /game-history/v1/health`
- **Response**: Connectivity and status for API, Postgres, Kafka, and background workers.

## Error Handling
- Standardized JSON errors with `code`, `message`, and optional `details`.
- 4xx for validation/auth failures; 5xx for ingestion or storage errors; 429 for enforced rate limits on export endpoints.

## Versioning
- Base path `/game-history/v1`; additive changes via new fields.
- Breaking changes require a new versioned prefix and corresponding Bruno collections.
