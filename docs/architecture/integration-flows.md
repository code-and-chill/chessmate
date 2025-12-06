---
title: Integration Flows
service: global
status: draft
last_reviewed: 2025-12-06
type: architecture
---

# Integration Flows

Cross-service communication patterns and data flows.

## Player Registration & Onboarding

```
┌─────────────────────────────────────────────────────────────┐
│ Chess App (Client)                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. POST /v1/accounts (register)
                         │
           ┌─────────────▼──────────────────┐
           │ account-api                    │
           └──────┬──────────────────────────┘
                  │
                  │ 2. PlayerRegistered event
                  │
           ┌──────▼──────────────────┐
           │ matchmaking-api         │
           │ (subscribe/listen)      │
           │ - Add to player index   │
           └─────────────────────────┘
```

**Participants**:
- Chess App: User submits registration
- account-api: Creates account, publishes PlayerRegistered
- matchmaking-api: Subscribes to PlayerRegistered event

**Data Exchanged**:
- [Fill: What data is passed in each step]

---

## Game Matching & Starting

```
┌────────────────────────────────────┐
│ Chess App (Client)                 │
└─────────────┬──────────────────────┘
              │
              │ 1. POST /v1/queues/{queue}/join
              │
     ┌────────▼─────────────────────┐
     │ matchmaking-api              │
     │ - Validate player            │
     │ - Add to queue               │
     │ - Match with opponent        │
     └────┬──────────────────────────┘
          │
          │ 2. POST /v1/games (internal)
          │
     ┌────▼──────────────────────┐
     │ live-game-api             │
     │ - Create game session      │
     │ - Initialize board state   │
     │ - Return game_id           │
     └────┬───────────────────────┘
          │
          │ 3. GameStarted event
          │
          └────────────────────────┐
                                   │
              ┌────────────────────▼─┐
              │ matchmaking-api       │
              │ (acknowledge match)   │
              └──────────────────────┘
```

**Participants**:
- Chess App: User requests match
- matchmaking-api: Finds opponent, creates match
- live-game-api: Initializes game

**Data Exchanged**:
- [Fill: Game parameters, player ratings, board state]

---

## Live Game Play

```
┌──────────────────────┐         ┌──────────────────────┐
│ Chess App (Player 1) │         │ Chess App (Player 2) │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                │
           └────────────────┬───────────────┘
                            │
                    ┌───────▼────────┐
                    │ live-game-api  │
                    │ - Validate move│
                    │ - Update state │
                    │ - Broadcast    │
                    └────────────────┘
```

**Participants**:
- Chess App clients: Send moves, receive state updates
- live-game-api: Validates, updates, broadcasts

**Data Exchanged**:
- [Fill: Move notation, board state, game metadata]

---

## Game Event Ingestion & History

```
┌─────────────────────┐        ┌───────────────────────┐        ┌────────────────────┐
│ live-game-api       │  1.   │ Kafka topic:          │  2.   │ game-history-api     │
│ (publish events)    ├──────►│ game-events           ├──────►│ ingestion workers    │
└────────┬────────────┘       └──────────┬────────────┘       └──────────┬─────────┘
         │                                │                            3. │
         │                                │             ┌─────────────────▼────────────┐
         │                                │             │ Postgres (games, player_games)│
         │                                │             └─────────────────┬────────────┘
         │                                │                            4. │
         │                                │             ┌─────────────────▼────────────┐
         │                                │             │ S3 Archive (raw + compact)   │
         │                                │             └──────────────────────────────┘
```

**Participants**:
- live-game-api publishes GameCreated/MoveMade/GameEnded/GameAborted/GameResigned/GameTimeout events to Kafka partitioned by `gameId`.
- game-history-api ingestion workers consume ordered events, update Postgres, and trigger archival.
- Postgres hosts `games` and `player_games` hot partitions; S3 stores raw and compacted archives for analytics and replay.

**Data Exchanged**:
- Kafka events: envelopes with `eventId`, `eventType`, `gameId`, `occurredAt`, and type-specific payloads.
- Postgres writes: canonical game summaries, move lists, and player index rows with filterable metadata.
- S3 objects: compressed JSON/Parquet partitioned by region/date/hour for long-term retention.

---

## [Additional Flow - Fill as Needed]

**Fill:** Document other significant integration flows.

```
[ASCII diagram or description of flow]
```

**Participants**:
- [Services involved]

**Data Exchanged**:
- [What data is passed]

---

## Communication Patterns

### Synchronous (Request-Reply)
Used for:
- Player validation during matchmaking
- Move execution and response
- Account lookup

### Asynchronous (Event-Driven)
Used for:
- Player registration notifications
- Game completion announcements
- Account updates

### Message Queue
**Fill:** Document if/how message queues are used.

---

## Error Handling in Flows

**Fill:** Define how errors propagate across services.

- Transient errors (retry logic)
- Service unavailability (circuit breakers)
- Data consistency (eventual consistency vs transactions)
- Compensation (saga pattern for distributed transactions)

---

*Last updated: 2025-12-06*
