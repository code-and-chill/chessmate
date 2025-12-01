# Settings Feature

## Overview

The Settings feature provides a comprehensive user settings and profile management interface. It follows the same architectural patterns as other features (like `board` and `game`) with proper service integration, hooks, and component structure.

## Architecture

```
features/settings/
├── index.ts                    # Public API exports
├── types/
│   └── index.ts               # TypeScript interfaces and types
├── hooks/
│   ├── index.ts               # Hook exports
│   ├── useUserProfile.ts      # Profile data management
│   ├── useUserStats.ts        # Statistics fetching
│   └── useUserPreferences.ts  # User preferences management
├── components/
│   ├── index.ts               # Component exports
│   ├── SettingsHub.tsx        # Main hub with navigation cards
│   ├── ProfileView.tsx        # Profile editing
│   ├── StatsView.tsx          # Statistics display
│   ├── AchievementsView.tsx   # Achievement tracking
│   ├── PreferencesView.tsx    # Game preferences
│   └── AppearanceView.tsx     # Theme and display settings
└── screens/
    └── SettingsScreen.tsx     # Main screen container
```

## Features

### 1. **Settings Hub**
- Profile overview card with avatar, username, email
- Quick stats display (rating, games played, win rate)
- Navigation cards to different settings sections
- Real-time data from account-api and rating-api

### 2. **Profile Management**
- Edit display name, bio, country
- Avatar management
- View username and email (read-only)
- Integration with account-api update endpoints

### 3. **Statistics**
- Time control switching (Blitz, Rapid, Classical)
- Current rating and peak rating display
- Win/Loss/Draw record with percentages
- Performance insights (best opening, avg move time, streaks, trends)
- Visual progress bars

### 4. **Achievements**
- Unlocked and in-progress achievements
- Progress tracking for locked achievements
- Visual badges and icons
- Completion percentage

### 5. **Game Preferences**
- Board & Pieces (theme, piece set, coordinates, highlighting)
- Gameplay (auto-queen, legal moves, premoves, confirmations)
- Sounds & Animations
- Analysis settings

### 6. **Appearance**
- Theme selection (Light, Dark, Auto)
- Display settings (language, time format, notation)
- Accessibility options

## Service Integration

### Account API Integration
```typescript
const { profile, loading, error, updateProfile } = useUserProfile(userId);

// Update profile
await updateProfile({
  displayName: 'New Name',
  bio: 'Updated bio',
  country: 'US',
});
```

### Rating API Integration
```typescript
const { stats, loading, error } = useUserStats(userId, 'blitz');

// stats contains:
// - rating, peak, games, wins, losses, draws, winRate
// - insights (bestOpening, avgMoveTime, currentStreak, ratingTrend)
```

### Preferences Management
```typescript
const { preferences, updatePreferences } = useUserPreferences(userId);

// Update preferences
await updatePreferences({
  game: { boardTheme: 'wood' },
  sound: { soundEffects: false },
});
```

## Mock Data Support

All services work with mock data during development:

- **MOCK_USER**: User profile data
- **MOCK_STATS**: Statistics for all time controls with insights
- **MOCK_ACHIEVEMENTS**: Unlocked and locked achievements
- Mock API clients simulate async behavior with delays

## Usage

### In Route Files

```typescript
import { SettingsScreen } from '@/features/settings';

export default function SettingsTab() {
  return (
    <View style={{ flex: 1 }}>
      <SettingsScreen userId="current-user" />
    </View>
  );
}
```

### Direct Component Usage

```typescript
import { SettingsHub, ProfileView, StatsView } from '@/features/settings';

// Use individual components
<SettingsHub onNavigate={setMode} userId={userId} />
<ProfileView onBack={() => {}} userId={userId} />
<StatsView onBack={() => {}} userId={userId} />
```

### Using Hooks

```typescript
import { useUserProfile, useUserStats } from '@/features/settings';

function MyComponent() {
  const { profile, loading, updateProfile } = useUserProfile('user-id');
  const { stats } = useUserStats('user-id', 'blitz');
  
  // Use profile and stats data
}
```

## Type Definitions

### Core Types
```typescript
type SettingsMode = 'hub' | 'profile' | 'stats' | 'achievements' | 'preferences' | 'appearance';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  displayName?: string;
  bio?: string;
  country?: string;
  memberSince: string;
  ratings: {
    blitz: number;
    rapid: number;
    classical: number;
  };
}

interface UserStats {
  timeControl: 'blitz' | 'rapid' | 'classical';
  rating: number;
  peak: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  insights: {
    bestOpening: string;
    avgMoveTime: string;
    currentStreak: string;
    ratingTrend: string;
  };
}
```

See `types/index.ts` for complete type definitions.

## API Endpoints

### Account API
- `GET /v1/accounts/me` - Get current user profile
- `PATCH /v1/accounts/me` - Update profile
- `PATCH /v1/accounts/me/preferences` - Update preferences (TODO)

### Rating API  
- `GET /v1/ratings/:userId/stats?time_control=blitz` - Get statistics
- `GET /v1/ratings/:userId/history` - Get rating history

## Development Roadmap

### Phase 1 (Current) ✅
- [x] Basic feature structure
- [x] Settings hub with navigation
- [x] Profile viewing and editing
- [x] Statistics display with time controls
- [x] Achievements view
- [x] Preferences view
- [x] Appearance settings
- [x] Mock data integration

### Phase 2 (Next)
- [ ] Real API integration (replace mocks)
- [ ] Preferences API endpoint integration
- [ ] Avatar upload functionality
- [ ] Achievement unlock animations
- [ ] Recent games list with details
- [ ] Rating history chart
- [ ] Settings search/filter

### Phase 3 (Future)
- [ ] Export/import settings
- [ ] Privacy settings
- [ ] Notification preferences
- [ ] Account security settings
- [ ] Social settings (friends, blocks)
- [ ] Linked accounts

## Testing

```bash
# Run app in development mode
npm start

# Navigate to Settings tab
# Test all views by clicking navigation cards
# Test profile updates
# Switch between time controls in stats
```

## Notes

- All components use React hooks for state management
- Service integration follows the same pattern as PlayScreen
- Mock data provides realistic delays for testing
- Components are fully typed with TypeScript
- Follows app folder structure conventions
- Ready for real API integration

## Related Documentation

- [Account API Overview](../../../account-api/docs/overview.md)
- [Rating API Documentation](../../../rating-api/docs/overview.md)
- [App Architecture Guide](../../docs/overview.md)
- [Folder Structure Convention](../../docs/folder-structure-convention.md)
