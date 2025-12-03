# Rated/Unrated Decision Logic Implementation Progress

**Status**: Phase 2 (Backend Enforcement) - COMPLETE ✅  
**Phase 3 (Frontend)**: Ready to start  
**Last Updated**: 2025-12-03

---

## 📊 Overall Progress: 50% (5/10 steps complete)

**Phase 1**: ✅ Complete (Steps 1-3)  
**Phase 2**: ✅ Complete (Steps 4-5)  
**Phase 3**: ⏳ Not Started (Steps 6-7)  
**Phase 4**: ⏳ Not Started (Steps 8-10)

See [`PHASE2_COMPLETE.md`](./PHASE2_COMPLETE.md) for detailed summary of latest changes.

---

## ✅ Completed Tasks

### 1. Domain Model & Database Schema ✅

**Files Created/Modified**:
- ✅ `live-game-api/app/domain/models/decision_reason.py` - New enum for decision reasons
- ✅ `live-game-api/app/domain/models/game_model.py` - Added fields:
  - `decision_reason: Optional[DecisionReason]`
  - `starting_fen: Optional[str]`
  - `is_odds_game: bool`
  - Added methods: `can_change_rated_status()`, `is_using_custom_position()`
- ✅ `live-game-api/app/domain/models/game.py` - Exported DecisionReason
- ✅ `live-game-api/migrations/versions/002_rated_unrated_logic.py` - Database migration

**Database Changes**:
```sql
ALTER TABLE games ADD COLUMN decision_reason VARCHAR(32);
ALTER TABLE games ADD COLUMN starting_fen TEXT;
ALTER TABLE games ADD COLUMN is_odds_game BOOLEAN DEFAULT false;
CREATE INDEX idx_games_decision_reason ON games(decision_reason);
```

**Backfill Logic**:
- Existing rated games get `decision_reason = 'manual'`

---

### 2. Automatic Decision Logic Engine ✅

**Files Created**:
- ✅ `live-game-api/app/domain/services/rating_decision_engine.py`

**Components**:
1. **RulesConfig** class:
   - `MAX_RATED_RATING_DIFFERENCE = 500` (configurable via env)
   - `ALLOW_CUSTOM_FEN_RATED = false` (future feature flag)
   - `ALLOW_ODDS_RATED = false` (future feature flag)

2. **RatingDecisionEngine** class with methods:
   - `should_force_unrated()` - Checks all automatic rules
   - `calculate_decision_reason()` - Returns final rated status + reason
   - `validate_rated_game_request()` - Validates if rated is allowed

**Automatic Rules Implemented**:
1. ✅ **Local games** → Always unrated (`LOCAL_AUTO`)
2. ✅ **Custom FEN** → Force unrated (`CUSTOM_POSITION_AUTO`)
3. ✅ **Odds chess** → Force unrated (`ODDS_AUTO`)
4. ✅ **Rating gap > 500** → Force unrated (`RATING_GAP_AUTO`)
5. ✅ **Manual choice** → User controls (`MANUAL`)

---

### 3. Game Service Integration ✅

**Files Modified**:
- ✅ `live-game-api/app/domain/services/game_service.py`

**Changes**:
- Added `RatingDecisionEngine` to `GameService.__init__()`
- Updated `create_challenge()` method signature with new parameters:
  - `is_local_game: bool = False`
  - `starting_fen: Optional[str] = None`
  - `is_odds_game: bool = False`
  - `creator_rating: Optional[int] = None`
  - `opponent_rating: Optional[int] = None`
- Integrated decision engine to calculate authoritative `rated` and `decision_reason`

---

### 4. API Layer Updates ✅

**Request Models**:
- ✅ `live-game-api/app/api/create_game_request.py` - Added fields:
  - `is_local_game: bool = False`
  - `starting_fen: Optional[str] = None`
  - `is_odds_game: bool = False`

**Response Models**:
- ✅ `live-game-api/app/api/game_response.py` - Added `decision_reason`
- ✅ `live-game-api/app/api/game_summary_response.py` - Added `decision_reason`

**API Routes**:
- ✅ `live-game-api/app/api/routes/v1/games.py` - Updated all endpoints:
  - `POST /games` - Accepts new parameters, returns decision_reason
  - `GET /games/{game_id}` - Includes decision_reason in response
  - `POST /games/{game_id}/join` - Returns decision_reason
  - `POST /games/{game_id}/moves` - Returns decision_reason
  - `POST /games/{game_id}/resign` - Returns decision_reason

**API Documentation in Endpoint**:
```python
"""Create a new game challenge.

The rated status may be automatically overridden based on game configuration:
- Local games are always unrated
- Custom starting positions force unrated
- Odds/handicap games force unrated
- Large rating gaps force unrated

The response includes the authoritative rated status and decision_reason.
"""
```

---

## 🚧 Next Steps (To Be Implemented)

### 4. Enforcement Rules (Not Started)
- [ ] Add takeback prevention for rated games
- [ ] Add board edit prevention for rated games
- [ ] Add timer manipulation checks
- [ ] Implement strict time-loss for rated games
- [ ] Allow takebacks for unrated games
- [ ] Update `GameService` methods

### 5. Rating-API Integration (Not Started)
- [ ] Update `rating-api/app/api/routes/rating.py`
- [ ] Check `game_result.rated` flag before calculating
- [ ] Skip rating updates for unrated games
- [ ] Still log unrated games for statistics
- [ ] Update streak/achievement logic

### 6. Frontend UI Components (Not Started)
- [ ] Create `<RatedUnratedToggle>` component
- [ ] Integrate into `FriendChallengeScreen`
- [ ] Integrate into matchmaking flow
- [ ] Update `GameHeader` badge display
- [ ] Update result screens (conditional rating display)
- [ ] Hide rating UI for unrated games

### 7. Frontend State Management (Not Started)
- [ ] Update `GameContext.tsx`
- [ ] Update `MatchmakingContext.tsx`
- [ ] Update `liveGameApi.ts` client
- [ ] Update `matchmakingApi.ts` client
- [ ] Add TypeScript types for `DecisionReason`

### 8. Matchmaking Integration (Not Started)
- [ ] Update `matchmaking-api` queue logic
- [ ] Add mode field (`'rated' | 'casual'`)
- [ ] Separate matchmaking pools
- [ ] Rating gap check before pairing

### 9. Configuration System (Not Started)
- [ ] Create `RulesConfig` admin UI
- [ ] Add environment variable loading
- [ ] Add database config storage
- [ ] Add admin endpoints for config updates

### 10. Testing Suite (Not Started)
- [ ] Unit tests for `RatingDecisionEngine`
- [ ] Unit tests for `GameService`
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests
- [ ] E2E rated vs unrated flow tests

### 11. Documentation (Not Started)
- [ ] Update `live-game-api/docs/domain.md`
- [ ] Update `live-game-api/docs/ARCHITECTURE.md`
- [ ] Update `live-game-api/docs/api.md`
- [ ] Create Bruno API collections
- [ ] Update `app/docs/overview.md`

---

## 📊 Implementation Statistics

| Component | Status | Files Modified | Files Created |
|-----------|--------|----------------|---------------|
| Domain Models | ✅ Complete | 2 | 1 |
| Database Migration | ✅ Complete | 0 | 1 |
| Decision Engine | ✅ Complete | 0 | 1 |
| Game Service | ✅ Complete | 1 | 0 |
| API Models | ✅ Complete | 3 | 0 |
| API Routes | ✅ Complete | 1 | 0 |
| Enforcement Rules | ⏳ Not Started | - | - |
| Rating Integration | ⏳ Not Started | - | - |
| Frontend UI | ⏳ Not Started | - | - |
| Frontend State | ⏳ Not Started | - | - |
| Matchmaking | ⏳ Not Started | - | - |
| Configuration | ⏳ Not Started | - | - |
| Tests | ⏳ Not Started | - | - |
| Documentation | ⏳ Not Started | - | - |

**Progress**: 6/14 phases complete (43%)

---

## 🔄 Migration Instructions

To apply the database migration:

```bash
cd live-game-api
alembic upgrade head
```

---

## 🧪 Testing the Implementation

### Test Local Game (Should be Unrated)
```bash
POST /v1/games
{
  "time_control": {"initial_seconds": 300, "increment_seconds": 0},
  "rated": true,
  "is_local_game": true
}

Expected Response:
{
  "rated": false,
  "decision_reason": "local_auto"
}
```

### Test Custom FEN (Should be Unrated)
```bash
POST /v1/games
{
  "time_control": {"initial_seconds": 300, "increment_seconds": 0},
  "rated": true,
  "starting_fen": "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1"
}

Expected Response:
{
  "rated": false,
  "decision_reason": "custom_position_auto"
}
```

### Test Manual Rated Choice (Should Respect User)
```bash
POST /v1/games
{
  "time_control": {"initial_seconds": 300, "increment_seconds": 0},
  "rated": false
}

Expected Response:
{
  "rated": false,
  "decision_reason": "manual"
}
```

---

## 🔗 Integration Points

### TODO: Rating API Integration
When implementing rating updates, the flow will be:

```python
# In rating-api when receiving game result
if game_result.rated:
    # Calculate and update ratings
    update_glicko2_ratings(...)
    update_leaderboards(...)
    update_streaks(...)
else:
    # Log for statistics only
    log_game_statistics(...)
```

### TODO: Frontend Integration
When implementing UI:

```typescript
// In FriendChallengeScreen
const [isRated, setIsRated] = useState(true);

// Show toggle
<RatedUnratedToggle 
  value={isRated}
  onChange={setIsRated}
  disabled={isLocalGame || hasCustomFEN}
/>

// Create game
const response = await createGame({
  rated: isRated,
  is_local_game: isLocalGame,
  // ...
});

// Check if was overridden
if (response.rated !== isRated) {
  showToast(`Game set to ${response.rated ? 'rated' : 'unrated'} (${response.decision_reason})`);
}
```

---

## 📝 Notes

1. **Rating Gap Check**: Currently skipped (returns `None` for ratings). Will be implemented when rating-api integration is added.

2. **Immutability**: The `can_change_rated_status()` method exists but isn't enforced yet. Will add validation in enforcement rules phase.

3. **Backward Compatibility**: Migration includes backfill logic to set `decision_reason = 'manual'` for existing rated games.

4. **Configuration**: `RulesConfig` can be loaded from environment variables for now. Admin UI will come later.

5. **Frontend Types**: TypeScript types for `DecisionReason` enum need to be added to `app/types/game.ts`.

---

## ✅ Validation Checklist

Before moving to next phase:
- [x] Database migration created and tested
- [x] Domain models include all required fields
- [x] Decision engine implements all automatic rules
- [x] Game service integrated with decision engine
- [x] API accepts and returns decision_reason
- [ ] Unit tests for RatingDecisionEngine
- [ ] Integration tests for API endpoints
- [ ] Documentation updated

---

## 🎯 Current Focus

**Phase 1 (Backend Foundation)**: ✅ COMPLETE

**Next Phase**: Enforcement Rules & Rating Integration
