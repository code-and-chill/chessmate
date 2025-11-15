---
title: Account API Reference
service: account-api
status: draft
last_reviewed: 2025-11-15
type: api
---

# Account API Reference

REST API endpoints for account and profile management.

## Authentication

All endpoints require JWT token in `Authorization: Bearer <token>` header.

## Public Endpoints (/v1)

### Get Current User Profile

**Endpoint**: `GET /v1/accounts/me`

**Description**: Retrieve the authenticated user's full profile.

**Request**:
```
GET /v1/accounts/me HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "id": "account-uuid",
  "username": "player_name",
  "display_name": "Player Name",
  "email": "player@example.com",
  "avatar_url": "https://...",
  "country": "US",
  "title": "GM",
  "bio": "Chess enthusiast"
}
```

### Get Public Profile

**Endpoint**: `GET /v1/accounts/{username}`

**Description**: Retrieve public profile information for a player.

**Parameters**:
- `username` (path): Player's username

**Response** (200 OK):
```json
{
  "username": "player_name",
  "display_name": "Player Name",
  "avatar_url": "https://...",
  "title": "GM",
  "country": "US"
}
```

### Update Profile

**Endpoint**: `PATCH /v1/accounts/me`

**Description**: Update user's profile information.

**Request Body**:
```json
{
  "display_name": "New Name",
  "bio": "Updated bio",
  "avatar_url": "https://..."
}
```

**Response** (200 OK): Updated profile object

## Internal Endpoints (/internal)

(Fill: Document internal service-to-service endpoints)

## Error Codes

| Code | Message | Meaning |
|------|---------|----------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

## Rate Limiting

(Fill: Document rate limits if applicable)

---

*Last updated: 2025-11-15*
