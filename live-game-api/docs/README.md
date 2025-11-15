---
title: Live Game Service Overview
service: live-game-api
status: active
last_reviewed: 2025-11-15
type: overview
---

# Live Game Service Documentation

## Overview

The Live Game Service manages real-time chess games, including game creation, player management, move validation, and game state tracking. It provides a complete API for creating challenges, joining games, and making moves with real-time updates.

## Key Capabilities

- Create chess challenges between players
- Join active games as challenger
- Validate moves using chess rules
- Track game state and move history
- Handle game outcomes (checkmate, stalemate, resignation)
- Manage time controls for timed games
- Support real-time game subscriptions (WebSocket-ready)

## Ubiquitous Language

- **Game**: A complete chess match between two players
- **Challenge**: Invitation for another player to play
- **Move**: A single chess piece movement by a player
- **Board State**: Current position of all pieces on the board
- **Time Control**: Game time limit configuration (bullet, blitz, rapid, classical)
- **Aggregate Root**: Game entity containing all moves and state
- **Domain Event**: Game state change (created, started, moved, ended)

## Integration Patterns

- **Move Validation**: Uses python-chess library for rule enforcement
- **Game Events**: Emits domain events for game lifecycle (GameCreatedEvent, GameStartedEvent, MovePlayedEvent, GameEndedEvent)
- **Player Resolution**: Depends on account-api for user validation
- **Real-time Updates**: WebSocket support for live game subscriptions (future)

## Service Dependencies

- PostgreSQL: Game state and move history persistence
- Account Service: Player identity and authentication
- python-chess: Chess rule validation and move generation

## API Overview

See `overview.md` for complete API specification and examples.

## Architecture Highlights

- **Domain-Driven Design**: Game aggregate root with rich domain models
- **Event Sourcing Ready**: All state changes captured as domain events
- **Repository Pattern**: Clean data access abstraction
- **Async/Await**: Non-blocking I/O for scalability
- **Type Safety**: Pydantic models and type hints throughout
