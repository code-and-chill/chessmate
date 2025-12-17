---
title: Rating API Service Scorecard
service: rating-api
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Service Scorecard: rating-api

**Service**: rating-api  
**Status**: 🟨 **PARTIAL**  
**Overall Readiness**: 60%

## Summary

**Strengths**:
- Idempotency implemented (`(game_id, pool_id)` uniqueness)
- Glicko-2 engine with extensible interface
- Transactional outbox pattern
- Clear domain model

**Critical Gaps**:
- Consumes HTTP POST not events
- No backfill/replay strategy
- No leaderboard materialization
- Event outbox publisher not implemented

## Key Findings

### Consumes game.ended Async: ❌ Fail
- Currently uses HTTP POST `/v1/game-results`
- Should consume `game.ended` events from Kafka
- Tight coupling to live-game-api

### Rating Correctness Rules: ✅ Pass
- Glicko-2 implementation
- Idempotency enforced
- Audit trail (rating_event table)

### Leaderboard Materialization: ❌ Fail
- No leaderboard table
- No materialization strategy
- No recomputation logic

### Backfill/Replay from Event Log: ❌ Fail
- No backfill tooling
- No replay capability
- Cannot recover from data loss

## Top 3 Risks

1. **HTTP Coupling** (P0) - Should consume events, not HTTP
2. **No Backfill Strategy** (P1) - Cannot recover from data loss
3. **No Leaderboard** (P1) - Cannot serve leaderboard queries efficiently

## P0 Remediation Items

### AUD-019: Consume game.ended Events
**Owner**: rating-api  
**Problem**: Uses HTTP POST instead of events  
**Evidence**: `rating-api/app/api/routes/v1/game_results.py` - HTTP endpoint

**Fix**:
1. Add Kafka consumer for `game.ended` events
2. Process events asynchronously
3. Keep HTTP endpoint for backward compatibility (deprecate)
4. Migrate to event-driven architecture

**Acceptance Criteria**:
- Consumes game.ended events from Kafka
- Processes events asynchronously
- HTTP endpoint deprecated
- Idempotency maintained

### AUD-020: Implement Backfill Strategy
**Owner**: rating-api  
**Problem**: No backfill, cannot recover from data loss  
**Fix**:
1. Add backfill tooling to replay events from Kafka
2. Add admin endpoint for backfill
3. Document backfill procedure

**Acceptance Criteria**:
- Can replay events from Kafka
- Backfill maintains idempotency
- Admin endpoint for backfill

### AUD-021: Implement Leaderboard Materialization
**Owner**: rating-api  
**Problem**: No leaderboard, cannot serve queries efficiently  
**Fix**:
1. Create leaderboard table
2. Materialize leaderboard on rating updates
3. Add recomputation logic
4. Add leaderboard API endpoints

**Acceptance Criteria**:
- Leaderboard table exists
- Materialized on rating updates
- Can recompute leaderboard
- API endpoints for leaderboard queries

