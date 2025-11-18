---
title: Chess App API Reference
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: api
---

# Chess App API Reference

Client interface specification for chess-app (web and mobile).

## Authentication Flow

1. User enters credentials
2. Call account-api `POST /v1/auth/login`
3. Receive JWT token
4. Store token in secure storage
5. Include in all subsequent API calls via `Authorization: Bearer <token>`

## API Integration Points

### Account Service

- `GET /v1/accounts/me` - Get logged-in user's profile
- `PATCH /v1/accounts/me` - Update profile
- `GET /v1/accounts/{username}` - Get opponent profile

### Live Game Service

- `POST /v1/games` - Create new game
- `GET /v1/games/{game_id}` - Get game state (polling or WebSocket)
- `POST /v1/games/{game_id}/moves` - Submit move

### Matchmaking Service

- `POST /v1/matchmaking/queue` - Join queue
- `GET /v1/matchmaking/queue/{queue_id}` - Check match status
- `DELETE /v1/matchmaking/queue/{queue_id}` - Leave queue

## Error Handling

All API responses include:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

*Last updated: 2025-11-15*
