---
title: Service Catalog
service: global
status: draft
last_reviewed: 2025-12-06
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
| rating-api | API | Python | Draft | [Owner] |
| bot-orchestrator-api | API | Python | Draft | [Owner] |
| engine-cluster-api | Service | Python | Draft | [Owner] |
| chess-knowledge-api | Service | Python | Draft | [Owner] |
| game-history-api | API | Go | Draft | [Owner] |
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

## game-history-api

**Type**: API Service
**Language**: Go
**Domain**: Game History & Analytics

**Responsibilities**:
- Ingest ordered game events (GameCreated, MoveMade, GameEnded/Aborted/Resigned/Timeout) from Kafka topic `game-events`.
- Build and persist canonical game summaries and compact move lists in partitioned Postgres tables.
- Maintain player-indexed views for reverse-chronological history with filters and pagination.
- Archive raw event streams and compacted records to S3 for long-term retention and offline analytics.
- Serve REST endpoints for game lookup, player history, bulk exports, health, and admin rebuilds.

**Key Endpoints**:
- `GET /game-history/v1/games/{gameId}` - Retrieve canonical game summary and moves
- `GET /game-history/v1/players/{playerId}/games` - Paginated player history with filters
- `GET /game-history/v1/export/games` - Internal export for analytics/puzzles
- `POST /game-history/v1/admin/games/{gameId}/rebuild` - Rebuild records from Kafka/S3
- `GET /game-history/v1/health` - Service health and dependency checks

**Upstream Dependencies**:
- live-game-api (event publisher via Kafka)
- account-api (player identity and visibility rules)

**Downstream Dependencies**:
- rating-api (rating updates)
- puzzle-api (puzzle mining)
- future fair-play-api (anti-cheat analysis)

**Quick Start**:
- Repository: `/workspaces/chessmate/game-history-api/`
- Docs: `./game-history-api/docs/`
- Dev Guide: `./game-history-api/docs/how-to/local-dev.md`

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

## rating-api

**Type**: API Service  
**Language**: Python (FastAPI)  
**Domain**: Ratings & Skill

**Responsibilities**:
- Maintain per-user, per-pool ratings (Glicko-2)
- Process game results idempotently
- Provide ratings to matchmaking and leaderboards
- Emit rating.updated events (outbox → bus)

**Key Endpoints**:
- `GET /v1/ratings/{user_id}` - All pool snapshots
- `GET /v1/ratings/{user_id}/pools/{pool_id}` - Single pool
- `POST /v1/ratings/bulk` - Bulk fetch by user_ids
- `POST /v1/game-results` - Ingest single game result

**Upstream Dependencies**:
- live-game-api / game-history-api (game results)

**Downstream Dependencies**:
- matchmaking-api (rating fetch)
- leaderboard-api (aggregation)

**Quick Start**:
- Repository: `/workspaces/chessmate/rating-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/how-to/local-dev.md`

---

## bot-orchestrator-api

**Type**: API Service  
**Language**: Python (FastAPI)  
**Domain**: Bots & Orchestration

**Responsibilities**:
- Orchestrate bot move selection per BotSpec
- Integrate engine-cluster and chess-knowledge
- Apply mistake and style models
- Provide introspection endpoints

**Key Endpoints**:
- `POST /v1/bots/{bot_id}/move`
- `GET /v1/bots/{bot_id}/spec`
- `GET /v1/debug/last-moves`
- `GET /health`

**Upstream Dependencies**:
- bot-config-api (BotSpec)
- engine-cluster-api (evaluation)
- chess-knowledge-api (book/tablebases)

**Downstream Dependencies**:
- live-game-api (bot moves)

**Quick Start**:
- Repository: `/workspaces/chessmate/bot-orchestrator-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/how-to/local-dev.md`

---

## engine-cluster-api

**Type**: Service  
**Language**: Python (FastAPI)  
**Domain**: Chess Engine

**Responsibilities**:
- Evaluate chess positions using Stockfish-like engines
- Generate candidate moves with evaluations
- Multi-PV analysis support
- Configurable depth and time limits

**Key Endpoints**:
- `POST /v1/evaluate`
- `GET /health`

**Upstream Dependencies**:
- None (core service)

**Downstream Dependencies**:
- bot-orchestrator-api (move evaluation)
- analysis services (position analysis)

**Quick Start**:
- Repository: `/workspaces/chessmate/engine-cluster-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/how-to/local-dev.md`

---

## chess-knowledge-api

**Type**: Service  
**Language**: Python (FastAPI)  
**Domain**: Chess Knowledge

**Responsibilities**:
- Provide opening book queries
- Endgame tablebase lookups
- Repertoire-based move suggestions
- Optimal endgame play

**Key Endpoints**:
- `POST /v1/opening/book-moves`
- `POST /v1/endgame/tablebase`
- `GET /health`

**Upstream Dependencies**:
- None (data service)

**Downstream Dependencies**:
- bot-orchestrator-api (opening/endgame)
- analysis services (knowledge lookups)

**Quick Start**:
- Repository: `/workspaces/chessmate/chess-knowledge-api/`
- Docs: `./docs/README.md`
- Dev Guide: `./docs/how-to/local-dev.md`

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
- Dev Guide: `./ARCHITECTURE.md` (see `./chess-app/docs/ARCHITECTURE.md`)

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

*Last updated: 2025-12-06*
