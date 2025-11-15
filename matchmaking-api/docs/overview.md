---
title: Matchmaking API Specification
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: overview
---

# Matchmaking API Specification

Player pairing and queue management for chess games.

## Overview

The Matchmaking API manages the queue of players waiting for games and matches compatible opponents based on:
- Time control preferences
- Rating range
- Geographic preferences
- Pairing history (avoiding rematches)

## Core Concepts

### Queue Entry

A player waiting for a game.

**State**: `waiting | matched | cancelled`

**Attributes**:
- Player ID
- Time control
- Rating range (min/max)
- Regions (preferred geographies)
- Wait duration

### Match

Two players paired for a game.

**Process**:
1. Player A joins queue
2. Player B joins queue
3. Matchmaking algorithm evaluates compatibility
4. If match: Create game via live-game-api
5. Remove both from queue

## Matching Algorithm

### Phase 1: Rating Matching

Attempt to match players with similar ratings:
- Target: Rating difference < 200 points
- Fallback: Broaden range by 50 points per 30 seconds of wait

### Phase 2: Fairness

- Prefer players with fewer color (white/black) plays
- Distribute colors evenly across platform

### Phase 3: Regional Preference

- Match geographically close players when possible
- Fallback to any player if wait time exceeds threshold

## API Reference

See `/v1/matchmaking/queue` endpoints in `api.md`.

## Integration Points

- **Account API**: Verify player ratings and status
- **Live Game API**: Create matched game
- **Event Bus**: Publish match events

---

*Last updated: 2025-11-15*
