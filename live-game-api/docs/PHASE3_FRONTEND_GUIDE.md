# Phase 3: Frontend Implementation - Quick Start Guide

**Prerequisites**: Phase 1 & 2 Complete ✅

---

## Step 6: Frontend UI Components

### 6.1 Create RatedUnratedToggle Component

**Location**: `app/ui/components/RatedUnratedToggle.tsx`

**Purpose**: Allow players to manually select rated/unrated before game creation

**Props**:
```typescript
type RatedUnratedToggleProps = {
  value: boolean;
  onChange: (rated: boolean) => void;
  disabled?: boolean;  // For when automatic override applies
  autoReason?: DecisionReason | null;  // Show why it's forced
};
```

**Design** (using DLS):
- Use `SegmentedControl` pattern from design-language-system.md
- Two segments: "Rated" | "Casual"
- If `disabled`, show badge with reason (e.g., "Local game - unrated")
- Theme-aware colors from `useColors()`

**Example**:
```tsx
<RatedUnratedToggle
  value={rated}
  onChange={setRated}
  disabled={isLocalGame}
  autoReason={isLocalGame ? 'LOCAL_AUTO' : null}
/>

{autoReason && (
  <Text variant="caption" style={{ color: colors.foreground.muted }}>
    ⓘ {getDecisionReasonMessage(autoReason)}
  </Text>
)}
```

---

### 6.2 Update FriendChallengeScreen

**Location**: `app/features/game/screens/FriendChallengeScreen.tsx`

**Changes**:
1. Add `rated` state: `const [rated, setRated] = useState(true);`
2. Add RatedUnratedToggle before "Send Challenge" button
3. Pass `rated` to `createFriendChallenge()`
4. Show override reason if backend forces unrated

**Placement**: Between time control selection and "Send Challenge" button

---

### 6.3 Update GameHeader Component

**Location**: `app/ui/components/GameHeader.tsx`

**Changes**:
1. Add badge showing "Rated" or "Casual"
2. Position badge next to timer/player names
3. Use conditional styling:
   - Rated: Accent color badge (blue/purple)
   - Casual: Neutral gray badge

**Example**:
```tsx
{game.rated ? (
  <Badge variant="accent" size="sm">⭐ Rated</Badge>
) : (
  <Badge variant="neutral" size="sm">🎮 Casual</Badge>
)}
```

---

### 6.4 Update GameResultScreen

**Location**: `app/features/game/screens/GameResultScreen.tsx`

**Changes**:
1. Conditionally show rating changes:
   ```tsx
   {game.rated && ratingChange && (
     <Text>Rating: {oldRating} → {newRating} ({ratingChange > 0 ? '+' : ''}{ratingChange})</Text>
   )}
   
   {!game.rated && (
     <Text variant="caption" style={{ color: colors.foreground.muted }}>
       Casual game - rating unchanged
     </Text>
   )}
   ```

2. Hide rating-related stats for unrated games:
   - Don't show rating graph
   - Don't show streak updates
   - Don't show leaderboard position changes

---

### 6.5 Update MatchmakingQueueScreen

**Location**: `app/features/matchmaking/screens/MatchmakingQueueScreen.tsx`

**Changes**:
1. Add mode selection before joining queue:
   ```tsx
   <RatedUnratedToggle
     value={mode === 'rated'}
     onChange={(rated) => setMode(rated ? 'rated' : 'casual')}
   />
   ```

2. Pass mode to `joinQueue()` function
3. Show different queue stats:
   - Rated: "Searching for rated opponent..."
   - Casual: "Searching for practice game..."

---

## Step 7: Frontend State Management

### 7.1 Update GameContext

**Location**: `app/contexts/GameContext.tsx`

**Changes**:

1. **createLocalGame()** - Force unrated:
   ```typescript
   const createLocalGame = async (timeControl: TimeControl) => {
     const game = await liveGameApi.createGame({
       time_control: timeControl,
       rated: false,  // Always false for local games
       is_local_game: true,
     });
     
     // Handle automatic override
     if (game.decision_reason === 'LOCAL_AUTO') {
       showToast('Local games are always unrated');
     }
     
     return game;
   };
   ```

2. **createFriendChallenge()** - Accept rated parameter:
   ```typescript
   const createFriendChallenge = async (
     friendId: string,
     timeControl: TimeControl,
     rated: boolean = true,  // Default to rated
     options?: {
       starting_fen?: string;
       is_odds_game?: boolean;
     }
   ) => {
     const game = await liveGameApi.createGame({
       time_control: timeControl,
       rated,
       is_local_game: false,
       starting_fen: options?.starting_fen,
       is_odds_game: options?.is_odds_game,
     });
     
     // Handle automatic overrides
     if (game.decision_reason && game.decision_reason !== 'MANUAL') {
       const reason = getDecisionReasonMessage(game.decision_reason);
       showToast(`Game set to ${game.rated ? 'rated' : 'unrated'}: ${reason}`);
     }
     
     return game;
   };
   ```

---

### 7.2 Update MatchmakingContext

**Location**: `app/contexts/MatchmakingContext.tsx`

**Changes**:

1. **Add mode state**:
   ```typescript
   const [mode, setMode] = useState<'rated' | 'casual'>('rated');
   ```

2. **Update joinQueue()**:
   ```typescript
   const joinQueue = async (timeControl: TimeControl) => {
     await matchmakingApi.joinQueue({
       time_control: timeControl,
       rated: mode === 'rated',
     });
     
     setQueueStatus({
       inQueue: true,
       mode,
       timeControl,
     });
   };
   ```

3. **Expose mode in context**:
   ```typescript
   return (
     <MatchmakingContext.Provider value={{
       mode,
       setMode,
       joinQueue,
       leaveQueue,
       // ... other values
     }}>
   ```

---

### 7.3 Update API Client

**Location**: `app/services/api/liveGameApi.ts`

**Changes**:

1. **Add new fields to CreateGameRequest**:
   ```typescript
   type CreateGameRequest = {
     time_control: TimeControl;
     rated?: boolean;  // Default true
     is_local_game?: boolean;  // Default false
     starting_fen?: string;  // Optional custom position
     is_odds_game?: boolean;  // Default false
   };
   ```

2. **Update GameResponse type**:
   ```typescript
   type GameResponse = {
     game_id: string;
     // ... existing fields
     rated: boolean;
     decision_reason: DecisionReason | null;
     starting_fen: string | null;
     is_odds_game: boolean;
   };
   ```

3. **Add DecisionReason type**:
   ```typescript
   type DecisionReason =
     | 'MANUAL'
     | 'LOCAL_AUTO'
     | 'RATING_GAP_AUTO'
     | 'CUSTOM_POSITION_AUTO'
     | 'ODDS_AUTO';
   ```

---

### 7.4 Add Helper Functions

**Location**: `app/util/game-helpers.ts`

**Functions**:

```typescript
export function getDecisionReasonMessage(reason: DecisionReason): string {
  switch (reason) {
    case 'LOCAL_AUTO':
      return 'Local games are always unrated';
    case 'RATING_GAP_AUTO':
      return 'Rating difference too large (>500 points)';
    case 'CUSTOM_POSITION_AUTO':
      return 'Custom starting positions are unrated';
    case 'ODDS_AUTO':
      return 'Odds games are unrated';
    case 'MANUAL':
      return 'Player choice';
    default:
      return 'System decision';
  }
}

export function getDecisionReasonIcon(reason: DecisionReason): string {
  switch (reason) {
    case 'LOCAL_AUTO':
      return '🏠';
    case 'RATING_GAP_AUTO':
      return '⚖️';
    case 'CUSTOM_POSITION_AUTO':
      return '♟️';
    case 'ODDS_AUTO':
      return '🎲';
    case 'MANUAL':
      return '👤';
    default:
      return 'ℹ️';
  }
}
```

---

## Testing Checklist

### UI Components
- [ ] RatedUnratedToggle renders correctly
- [ ] Toggle switches between states
- [ ] Disabled state shows reason badge
- [ ] Theme colors apply correctly

### Game Creation Flows
- [ ] Local game creation forces unrated
- [ ] Friend challenge allows rated/unrated selection
- [ ] Matchmaking shows mode selection
- [ ] Backend overrides display toast notifications

### Game Display
- [ ] GameHeader shows correct badge (Rated/Casual)
- [ ] Result screen conditionally shows rating changes
- [ ] Unrated games hide rating UI elements

### State Management
- [ ] GameContext creates games with correct rated flag
- [ ] MatchmakingContext tracks mode correctly
- [ ] API client includes all new fields
- [ ] Decision reasons display correct messages

---

## Implementation Order

1. ✅ Create helper functions first (`getDecisionReasonMessage`, `getDecisionReasonIcon`)
2. ✅ Update TypeScript types in `app/types/game.ts`
3. ✅ Update API client with new fields
4. ✅ Create RatedUnratedToggle component
5. ✅ Update contexts (GameContext, MatchmakingContext)
6. ✅ Update screens (FriendChallengeScreen, GameResultScreen, etc.)
7. ✅ Update GameHeader component
8. ✅ Test all flows end-to-end

---

## Design Language System (DLS) Compliance

All components **MUST** follow:
- Use design tokens from `app/ui/tokens/`
- Use primitives from `app/ui/primitives/`
- Use `useColors()` hook for theme awareness
- Follow spacing scale (spacingTokens)
- Use typography variants (textVariants)
- Follow Feature Screen Layout Pattern for hub screens

**Reference**: [`app/docs/design-language-system.md`](../../app/docs/design-language-system.md)

---

## Next Steps After Phase 3

**Phase 4**: Configuration & Testing
- Step 8: Admin configuration system
- Step 9: Comprehensive test suite
- Step 10: Documentation updates

---

**Ready to implement?** Start with Step 6.1 (RatedUnratedToggle component).
