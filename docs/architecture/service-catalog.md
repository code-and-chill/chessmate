---
title: Service Catalog
status: draft
last_reviewed: 2025-11-15
type: architecture
---

# Service Catalog

Complete index of all services in the platform with descriptions and quick reference.

## Service Summary

| Service | Type | Language | Status | Owner |
|---------|------|----------|--------|-------|
| account-api | API | Python | Operational | [Owner] |
| live-game-api | API | Python | Operational | [Owner] |
| matchmaking-api | API | Python | Operational | [Owner] |
| chess-app | Client | TypeScript | Operational | [Owner] |

---

## account-api

**Type**: API Service  
**Language**: Python (FastAPI)  
**Domain**: Identity & Account Management  

**Responsibilities**:
- Player account creation and management
- Player profile (display name, title, country, bio)
- Player preferences (UI and gameplay settings)
- Privacy and visibility controls
- Social counters (followers, friends)

**Key Endpoints**:
- `GET /v1/accounts/me` - Get current user profile
- `PATCH /v1/accounts/me` - Update profile
- `GET /v1/accounts/{username}` - Get public profile
- `POST /internal/accounts` - Create account (internal)

**Upstream Dependencies**:
- None (core service)

**Downstream Dependencies**:
- matchmaking-api (player information for matching)
- live-game-api (player information during games)

**Quick Start**:
- Repository: `/workspaces/chessmate/account-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/GETTING_STARTED.md`

---

## live-game-api

**Type**: API Service  
**Language**: Python (FastAPI)  
**Domain**: Real-Time Gaming  

**Responsibilities**:
- Active game state management
- Chess move validation and execution
- Game end conditions and result determination
- Real-time player synchronization
- Game history and replays

**Key Endpoints**:
- `POST /v1/games` - Start new game
- `GET /v1/games/{game_id}` - Get game state
- `POST /v1/games/{game_id}/moves` - Execute move
- `GET /v1/games/{game_id}/moves` - Get move history

**Upstream Dependencies**:
- account-api (player validation)
- matchmaking-api (match information)

**Downstream Dependencies**:
- None (end-user facing)

**Quick Start**:
- Repository: `/workspaces/chessmate/live-game-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/GETTING_STARTED.md`

---

## matchmaking-api

**Type**: API Service  
**Language**: Python (FastAPI)  
**Domain**: Player Matching & Pairing  

**Responsibilities**:
- Player queue management
- Rating-based player matching
- Skill level matching
- Wait time optimization
- Match creation and assignment

**Key Endpoints**:
- `POST /v1/queues/{queue_id}/join` - Join matchmaking queue
- `POST /v1/queues/{queue_id}/leave` - Leave queue
- `POST /internal/matches` - Create match (internal)
- `GET /internal/matches/{match_id}` - Get match details

**Upstream Dependencies**:
- account-api (player information and ratings)

**Downstream Dependencies**:
- live-game-api (assign matched players to game)

**Quick Start**:
- Repository: `/workspaces/chessmate/matchmaking-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/GETTING_STARTED.md`

---

## chess-app

**Type**: Client Application  
**Language**: TypeScript (React Native / React)  
**Domain**: User Interface  

**Responsibilities**:
- Mobile and web user interface
- Player authentication
- Game lobby and browsing
- Live game play interface
- Player profile management
- Social features

**Platforms**:
- Mobile (iOS/Android) via React Native
- Web (Desktop/Tablet) via React

**Upstream Dependencies**:
- account-api (authentication, profiles)
- matchmaking-api (player matching)
- live-game-api (live game state)

**Quick Start**:
- Repository: `/workspaces/chessmate/chess-app/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/PLAYSCREEN_ARCHITECTURE_DIAGRAMS.md`

---

## [New Service Template]

**Type**: [API | Worker | Engine | Client]  
**Language**: [Language]  
**Domain**: [Domain Name]  

**Responsibilities**:
- Fill: Main responsibilities

**Key Endpoints**:
- Fill: API endpoints or operations

**Upstream Dependencies**:
- Fill: Services this depends on

**Downstream Dependencies**:
- Fill: Services that depend on this

**Quick Start**:
- Repository: `/workspaces/chessmate/[service-name]/`
- Docs: `./docs/README.md`

---

*Last updated: 2025-11-15*
