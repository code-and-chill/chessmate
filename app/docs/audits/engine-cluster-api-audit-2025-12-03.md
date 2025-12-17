---
title: Engine-Cluster-API Usage Audit
service: global
status: active
last_reviewed: 2025-12-03
type: audit
---

# Engine-Cluster-API Usage Audit

**Date**: 2025-12-03  
**Service**: `engine-cluster-api`  
**Purpose**: Document current usage patterns and identify integration opportunities

## Executive Summary

The `engine-cluster-api` is a Python/FastAPI service that provides Stockfish-based chess position evaluation. Currently, it has **one active consumer** (`bot-orchestrator-api`) and **one planned consumer** (`puzzle-api`). The service is ready for integration with the React Native app for real-time position analysis.

## Current Consumers

### 1. bot-orchestrator-api ✅ (Active)

**Integration Point**: `bot-orchestrator-api/app/clients/engine.py`

**Usage Pattern**:
- Calls `POST /v1/evaluate` endpoint
- Used for generating bot moves during gameplay
- Has fallback mock implementation when `ENGINE_CLUSTER_URL` is not set

**Request Format**:
```python
{
    "fen": fen,
    "side_to_move": side_to_move[0],  # "w" or "b"
    "max_depth": query.max_depth,
    "time_limit_ms": query.time_limit_ms,
    "multi_pv": query.multi_pv,
}
```

**Response Handling**:
- Extracts `candidates` array from response
- Maps to `Candidate` domain model
- Returns list of candidate moves with evaluations

**Error Handling**:
- Falls back to mock candidates if `ENGINE_CLUSTER_URL` not configured
- Uses `httpx.AsyncClient` with timeout
- Raises exception on HTTP errors

**Configuration**:
- Environment variable: `ENGINE_CLUSTER_URL`
- Timeout: `HTTP_CLIENT_TIMEOUT_MS` (from settings)

### 2. puzzle-api ⏳ (Planned, Not Implemented)

**Status**: Listed as dependency in `puzzle-api/service.yaml` but **not yet integrated**

**Planned Usage** (from `puzzle-api/docs/migrations/phase-1.md`):
- **Phase 2 Candidate**: Automatic puzzle generation via engine-cluster-api
- Currently in "Known Limitations & Future Work" section
- No actual code integration found

**Recommendation**: Monitor for future implementation

## API Endpoint Verification

### Endpoints

1. **POST `/v1/evaluate`** ✅
   - **Status**: Active and working
   - **Request Schema**: Matches `EvaluateRequest` domain model
   - **Response Schema**: Matches `EvaluateResponse` domain model
   - **Documentation**: Accurate in `engine-cluster-api/docs/api.md`

2. **GET `/health`** ✅
   - **Status**: Active
   - **Response**: `{"status": "ok", "service": "engine-cluster-api"}`
   - **Documentation**: Basic health check

### Bruno Collection Issues Found

**Issue**: `engine-cluster-api/bruno/collections/post-analyze.bru` had incorrect endpoint
- **Wrong**: `/v1/engine/analyze`
- **Correct**: `/v1/evaluate`
- **Status**: ✅ Fixed during audit

**Additional Issues Fixed**:
- Request body missing required fields (`side_to_move`, `max_depth`, `time_limit_ms`)
- Response assertions checking for wrong fields (`best_move`, `evaluation` instead of `candidates`)
- **Status**: ✅ Fixed during audit

## API Contract Verification

### Request Model (`EvaluateRequest`)
```python
{
    "fen": str,                    # Required: Position in FEN notation
    "side_to_move": "w" | "b",     # Required: Side to move
    "max_depth": int,               # Optional: 1-30, default 12
    "time_limit_ms": int,          # Optional: 10-30000, default 1000
    "multi_pv": int                # Optional: 1-10, default 1
}
```

### Response Model (`EvaluateResponse`)
```python
{
    "candidates": [
        {
            "move": str,           # UCI notation (e.g., "e2e4")
            "eval": float,         # Evaluation in pawns
            "depth": int,          # Depth reached
            "pv": List[str]        # Principal variation (optional)
        }
    ],
    "fen": str,                    # Echo of input FEN
    "time_ms": int                 # Analysis time in milliseconds
}
```

### Domain Models
- `Candidate`: Move with evaluation, depth, and principal variation
- All models match between backend and documented API

## Integration Gaps

### App Integration Status

**Current State**:
- ❌ No API client for engine-cluster-api
- ❌ No hooks for position analysis
- ❌ UI components exist but not connected (`EvaluationBar`, `EvalBar`, `EvalGraph`)
- ❌ `showEngineLines` setting exists but unused
- ✅ Local `chess.js` engine used only for move validation

**Opportunities**:
1. **Real-time position analysis** during games
2. **Post-game analysis** with full engine evaluation
3. **Engine lines display** on board (arrows, highlights)
4. **Move quality feedback** using engine evaluations

## Service Health

### Documentation Status
- ✅ API documentation accurate (`docs/api.md`)
- ✅ Architecture documented (`docs/architecture.md`)
- ✅ Domain models documented (`docs/domain.md`)
- ✅ Operations runbook exists (`docs/operations.md`)

### Code Quality
- ✅ Type-safe with Pydantic models
- ✅ Error handling with fallback to mock
- ✅ Async/await pattern for non-blocking operations
- ✅ Configurable via environment variables

### Testing
- ✅ Bruno collections exist (now fixed)
- ⚠️ Unit tests exist (`tests/test_engine.py`)
- ⚠️ Integration tests recommended for app integration

## Recommendations

### Immediate Actions
1. ✅ **Fix Bruno collection** - Update endpoint and request/response format
2. **Create app API client** - Follow `BaseApiClient` pattern
3. **Add environment config** - Add engine-cluster-api URLs to app config
4. **Create analysis hooks** - `usePositionAnalysis` and `useGameAnalysis`

### Integration Priorities
1. **High Priority**: Real-time position analysis during games
2. **Medium Priority**: Post-game analysis screen
3. **Low Priority**: Engine lines display (requires board component updates)

### Technical Considerations
- **Rate Limiting**: Consider rate limiting for app requests
- **Caching**: Cache analysis results for same FEN positions
- **Debouncing**: Debounce rapid position changes
- **Error Handling**: Graceful degradation when engine unavailable
- **Performance**: Engine analysis can take 100-1000ms, consider async loading

## Service Dependencies

### engine-cluster-api Dependencies
- **None** - Standalone service

### Services That Depend on engine-cluster-api
- `bot-orchestrator-api` (active)
- `puzzle-api` (planned)
- `app` (recommended)

## Conclusion

The `engine-cluster-api` is well-documented, properly implemented, and ready for app integration. The main gap is the lack of an API client and hooks in the React Native app. The service follows good patterns and has proper error handling.

**Next Steps**: Proceed with Phase 2 (API Client Layer) of the integration plan.
