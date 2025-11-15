---
title: Matchmaking API Reference
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: api
---

# Matchmaking API Reference

REST API endpoints for player matching and queue management.

## Public Endpoints (/v1)

### Join Queue

**Endpoint**: `POST /v1/matchmaking/queue`

**Description**: Enter matchmaking queue.

**Request Body**:
```json
{
  "time_control": "5+3",
  "min_rating": 1200,
  "max_rating": 1800,
  "regions": ["US", "EU"]
}
```

**Response** (202 Accepted):
```json
{
  "queue_id": "queue-entry-uuid",
  "status": "waiting",
  "position": 5,
  "estimated_wait_ms": 15000
}
```

### Get Queue Status

**Endpoint**: `GET /v1/matchmaking/queue/{queue_id}`

**Description**: Check status of queue entry.

**Response** (200 OK):
```json
{
  "status": "matched | waiting",
  "game_id": "game-uuid (if matched)"
}
```

### Leave Queue

**Endpoint**: `DELETE /v1/matchmaking/queue/{queue_id}`

**Description**: Cancel matchmaking.

**Response** (204 No Content)

## Internal Endpoints (/internal)

(Fill: Document service-to-service endpoints)

---

*Last updated: 2025-11-15*
