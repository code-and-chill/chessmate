# API Integration Guide

## Mock Mode (Default)

By default, the app runs in **mock mode** to allow testing without backend integration.

### Features
- ✅ Realistic API delays (500ms)
- ✅ Complete mock data for all features
- ✅ Automatic matchmaking simulation
- ✅ Friend lists, stats, achievements, leaderboards
- ✅ No backend required

### Configuration

The app uses the `EXPO_PUBLIC_USE_MOCK_API` environment variable to toggle between mock and real APIs.

**Default behavior (Mock Mode):**
```bash
# No configuration needed - mock mode is default
npm start
```

**To use real APIs:**
```bash
# Create/edit .env file
echo "EXPO_PUBLIC_USE_MOCK_API=false" > .env

# Configure API URLs (optional, defaults to localhost)
echo "EXPO_PUBLIC_ACCOUNT_API_URL=http://localhost:8002" >> .env
echo "EXPO_PUBLIC_RATING_API_URL=http://localhost:8003" >> .env
echo "EXPO_PUBLIC_MATCHMAKING_API_URL=http://localhost:8004" >> .env
echo "EXPO_PUBLIC_PUZZLE_API_URL=http://localhost:8000" >> .env
echo "EXPO_PUBLIC_LIVE_GAME_API_URL=http://localhost:8001" >> .env

npm start
```

## Mock Data

Mock data is defined in `app/api/mockData.ts`:

- **User Profile**: ChessPlayer2025 with ratings (Blitz 1650, Rapid 1580, Classical 1720)
- **Friends**: 6 friends with various online/offline states
- **Stats**: Win/loss/draw records for all time controls
- **Achievements**: 8 achievements (4 unlocked, 4 in progress)
- **Leaderboards**: Global, friends, and club rankings
- **Rating History**: 9 data points showing rating progression

## API Clients

### Mock Clients (Default)
Located in `app/api/mockClients.ts`:
- `MockAccountApiClient`
- `MockRatingApiClient`
- `MockMatchmakingApiClient`

### Real Clients
Located in respective API files:
- `AccountApiClient` → `/api/v1/accounts/*`
- `RatingApiClient` → `/api/v1/ratings/*`
- `MatchmakingApiClient` → `/api/v1/matchmaking/*`
- `PuzzleApiClient` → `/api/v1/puzzles/*`
- `LiveGameApiClient` → `/api/v1/games/*`

## Usage in Components

```typescript
import { useApiClients } from '@/contexts/ApiContext';

function MyComponent() {
  const { accountApi, ratingApi, useMockApi } = useApiClients();
  
  // Shows 🎭 for mock, 🌐 for real APIs
  console.log('API mode:', useMockApi ? '🎭 Mock' : '🌐 Real');
  
  // API calls work the same regardless of mode
  const profile = await accountApi.getProfile(userId);
  const stats = await ratingApi.getStats(userId, 'blitz');
}
```

## Data Hooks

All hooks automatically use the configured API client mode:

```typescript
import { useProfile, useStats, useFriends, useAchievements } from '@/hooks/useData';

function ProfileScreen() {
  const { data: profile, loading, error, refetch } = useProfile();
  const { data: stats } = useStats(undefined, 'blitz');
  const { data: friends } = useFriends();
  const { data: achievements } = useAchievements();
  
  // Works identically in mock and real mode
}
```

## Testing Without Backend

1. **Start the app** (mock mode enabled by default):
   ```bash
   npm start
   ```

2. **Test all features**:
   - Navigate through all tabs (Play, Learn, Social, Settings)
   - View profile, stats, achievements
   - See friend lists with online status
   - Browse leaderboards (global, friends, club)
   - Start matchmaking (simulated)

3. **Check console** for API mode indicator:
   ```
   🎭 Using MOCK API clients
   ```

## Switching to Real APIs

When your backend services are running:

1. **Set environment variable**:
   ```bash
   EXPO_PUBLIC_USE_MOCK_API=false
   ```

2. **Restart the app**:
   ```bash
   npm start
   ```

3. **Verify in console**:
   ```
   🌐 Using REAL API clients
   ```

## Production Deployment

For production, set environment variables in your deployment platform:

```env
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_ACCOUNT_API_URL=https://api.chess.com/account
EXPO_PUBLIC_RATING_API_URL=https://api.chess.com/rating
EXPO_PUBLIC_MATCHMAKING_API_URL=https://api.chess.com/matchmaking
EXPO_PUBLIC_PUZZLE_API_URL=https://api.chess.com/puzzle
EXPO_PUBLIC_LIVE_GAME_API_URL=https://api.chess.com/live-game
```

## Customizing Mock Data

Edit `app/api/mockData.ts` to customize:
- User profiles
- Friend lists
- Game statistics
- Achievements
- Leaderboard entries
- Rating history

Example:
```typescript
export const MOCK_USER = {
  id: 'my-user-id',
  username: 'MyUsername',
  email: 'my@email.com',
  // ... customize as needed
};
```
