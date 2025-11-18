---
title: Chess App Domain Model
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: domain
---

# Chess App Domain Model

Domain concepts for the chess-app client.

## User Context

Represents the logged-in player using the app.

**State**:
- `account_id`: Logged-in user's account
- `profile`: User profile information
- `authentication_token`: JWT for API calls
- `preferences`: UI and gameplay preferences

## Game Viewing Context

Display and interaction with chess games.

**State**:
- `current_game_id`: Active game being played or viewed
- `board_state`: Current board position
- `move_history`: List of moves in current game
- `player_perspective`: white | black (viewing angle)

## UI Domains

### Lobby Screen

Players browse active games and matchmaking options.

### Play Screen

Live chess board interface for playing games.

### Profile Screen

View and edit user profile information.

### Social Screen

View friends, followers, and player statistics.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| User | Authenticated player using the app |
| Profile | Player's public information |
| Game | Chess match currently displayed |
| Board | Visual representation of chess position |
| Move | User action to move a piece |
| Promotion | Pawn reaches 8th rank and becomes queen/rook/bishop/knight |

---

*Last updated: 2025-11-15*
