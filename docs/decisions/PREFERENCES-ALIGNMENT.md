---
title: Preferences API Alignment Plan
status: active
last_reviewed: 2025-12-01
type: decision
---

# Preferences API Alignment Plan

## Context

The frontend `UserPreferences` type and the backend `AccountPreferences` model were misaligned. This document outlines the alignment strategy and future work.

## Decision

**Approach: Bidirectional Alignment**
- **P0 (DONE):** Frontend adapts to backend for existing fields
- **P1 (TODO):** Backend extends to include missing frontend fields

---

## P0: Frontend Alignment (✅ COMPLETED)

### Changes Made

**Before (Nested Structure):**
```typescript
interface UserPreferences {
  game: { boardTheme, pieceSet, ... }
  sound: { soundEffects, moveAnimation, ... }
  analysis: { postGameAnalysis, ... }
}
```

**After (Flat Structure matching backend):**
```typescript
interface UserPreferences {
  // Backend fields (persisted)
  board_theme: string;
  piece_set: string;
  sound_enabled: boolean;
  animation_level: 'none' | 'minimal' | 'full';
  highlight_legal_moves: boolean;
  show_coordinates: boolean;
  confirm_moves: boolean;
  default_time_control: 'bullet' | 'blitz' | 'rapid' | 'classical';
  auto_queen_promotion: boolean;
  
  // Frontend-only fields (not yet persisted)
  vibration?: boolean;
  piece_animation?: boolean;
  post_game_analysis?: 'manual' | 'automatic' | 'off';
  show_engine_lines?: boolean;
  evaluation_bar?: boolean;
  best_move_hints?: 'never' | 'after_game' | 'always';
}
```

### Field Mapping

| Frontend (Old) | Backend API | Status |
|----------------|-------------|--------|
| `game.boardTheme` | `board_theme` | ✅ Mapped |
| `game.pieceSet` | `piece_set` | ✅ Mapped |
| `game.boardCoordinates` | `show_coordinates` | ✅ Mapped |
| `game.moveHighlighting` | `highlight_legal_moves` | ✅ Mapped |
| `game.autoQueenPromotion` | `auto_queen_promotion` | ✅ Mapped |
| `game.showLegalMoves` | `highlight_legal_moves` | ✅ Mapped (same as highlighting) |
| `game.confirmMoves` | `confirm_moves` | ✅ Mapped |
| `game.premovesEnabled` | ❌ Not in backend | ⚠️ Removed from UI for now |
| `sound.soundEffects` | `sound_enabled` | ✅ Mapped |
| `sound.moveAnimation` | `animation_level` | ✅ Mapped (enum conversion) |
| `sound.pieceAnimation` | ❌ Not in backend | ⚠️ Frontend-only (optional field) |
| `sound.vibration` | ❌ Not in backend | ⚠️ Frontend-only (optional field) |
| `analysis.*` | ❌ Not in backend | ⚠️ All frontend-only for now |
| ❌ Not in frontend | `default_time_control` | ✅ Added to UI |

### Animation Level Mapping

Backend uses enum, frontend had string:
- `'slow'` → `'minimal'`
- `'normal'` → `'full'`
- `'fast'` → `'full'`

---

## P1: Backend Extensions (📋 TODO)

### Recommended Backend Changes

**File:** `account-api/app/domain/models/account_preferences.py`

**Add these fields:**

```python
class AccountPreferences(BaseModel):
    # ... existing fields ...
    
    # Mobile-specific
    vibration_enabled: bool = True
    piece_animation_enabled: bool = True
    premove_enabled: bool = True
    
    # Analysis preferences
    post_game_analysis: Literal["manual", "automatic", "off"] = "automatic"
    show_engine_lines: bool = True
    evaluation_bar_enabled: bool = True
    best_move_hints: Literal["never", "after_game", "always"] = "after_game"
```

### Migration Required

**File:** `account-api/migrations/versions/XXXX_add_analysis_preferences.py`

```python
def upgrade():
    op.add_column('account_preferences', sa.Column('vibration_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('account_preferences', sa.Column('piece_animation_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('account_preferences', sa.Column('premove_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('account_preferences', sa.Column('post_game_analysis', sa.String(20), nullable=False, server_default='automatic'))
    op.add_column('account_preferences', sa.Column('show_engine_lines', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('account_preferences', sa.Column('evaluation_bar_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('account_preferences', sa.Column('best_move_hints', sa.String(20), nullable=False, server_default='after_game'))
```

### API Contract Update

**File:** `account-api/app/api/models/update_preferences_request.py`

Add optional fields:
```python
class UpdatePreferencesRequest(BaseModel):
    # ... existing fields ...
    
    vibration_enabled: Optional[bool] = None
    piece_animation_enabled: Optional[bool] = None
    premove_enabled: Optional[bool] = None
    post_game_analysis: Optional[Literal["manual", "automatic", "off"]] = None
    show_engine_lines: Optional[bool] = None
    evaluation_bar_enabled: Optional[bool] = None
    best_move_hints: Optional[Literal["never", "after_game", "always"]] = None
```

### Bruno Test Update

**File:** `account-api/bruno/collections/patch-preferences.bru`

Add new fields to test payload:
```json
{
  "board_theme": "green",
  "piece_set": "classic",
  "sound_enabled": true,
  "animation_level": "full",
  "highlight_legal_moves": true,
  "show_coordinates": true,
  "confirm_moves": false,
  "auto_queen_promotion": true,
  "vibration_enabled": true,
  "piece_animation_enabled": true,
  "premove_enabled": true,
  "post_game_analysis": "automatic",
  "show_engine_lines": true,
  "evaluation_bar_enabled": true,
  "best_move_hints": "after_game"
}
```

---

## Alternative: Separate Analysis Service

**Consideration:** Analysis preferences might belong in a separate `analysis-api` service if:
- Analysis is a distinct bounded context
- Other services (puzzle-api, bot-orchestrator-api) need analysis settings
- Analysis settings grow significantly complex

**Recommendation:** Keep in `account-api` for now since:
- These are user preferences (personal settings)
- Simple boolean/enum values
- Closely tied to gameplay experience
- Can be refactored later if needed

---

## Testing Checklist

### Frontend (✅ Done)
- [x] Update TypeScript types
- [x] Update mock data
- [x] Update UI components to use new field names
- [x] Add helper functions for display formatting
- [x] Verify no TypeScript errors

### Backend (📋 TODO)
- [ ] Add new fields to domain model
- [ ] Create database migration
- [ ] Update API request/response models
- [ ] Update service layer methods
- [ ] Update Bruno tests
- [ ] Test with real database
- [ ] Document field constraints and defaults

---

## Impact Analysis

### Breaking Changes
❌ None - Frontend is backward compatible with backend

### Non-Breaking Changes
✅ Frontend can now call existing backend API
✅ Optional fields allow gradual backend extension
✅ UI preserves same user experience

### Future Considerations
- Consider versioning preferences API if breaking changes needed
- Monitor which frontend-only fields are actually used
- Evaluate if analysis preferences should be separate service

---

## References

- Backend Model: `account-api/app/domain/models/account_preferences.py`
- Backend API: `account-api/app/api/routes/v1/accounts.py` (`PATCH /v1/accounts/me/preferences`)
- Frontend Types: `app/features/settings/types/index.ts`
- Frontend UI: `app/features/settings/components/PreferencesView.tsx`
- API Tests: `account-api/bruno/collections/patch-preferences.bru`

---

## Timeline

- **P0 (Frontend Alignment):** ✅ Completed (2025-12-01)
- **P1 (Backend Extension):** 📋 Scheduled for next sprint
  - Estimated effort: 2-3 hours
  - Tasks: Migration + API update + tests
