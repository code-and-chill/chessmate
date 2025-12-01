# Social Feature Module

**Status**: ✅ Active  
**Last Updated**: 2025-11-18  
**Service Integration**: account-api (friends), rating-api (leaderboards)

## Overview

The Social feature enables chess players to:
- Connect with friends and see who's online
- Join and participate in chess clubs
- View leaderboards (global, friends, club)
- Message other players
- Challenge friends to games

## Architecture

```
features/social/
├── types/           # TypeScript interfaces
├── hooks/           # Data fetching and state management
├── components/      # UI components
├── screens/         # Main screen container
└── index.ts         # Public API
```

### Service Integration

- **account-api**: Friends list, friend requests, user profiles
- **rating-api**: Leaderboards, player ratings, statistics
- **Future**: clubs-api, messaging-api

### Current Implementation Status

✅ **Implemented**:
- Friends view with real-time online status
- Leaderboard with global/friends/club tabs
- Social stats aggregation
- Challenge friends functionality
- Search and filtering

🚧 **Mock Data** (awaiting API):
- Clubs management
- Messaging/chat

## Usage

```tsx
import { SocialScreen } from '@/features/social';

export default function SocialTab() {
  const userId = 'current-user-id';
  
  return <SocialScreen userId={userId} />;
}
```

## Components

### SocialHub
Main hub with navigation cards and social statistics.

### FriendsView
- Friends list with online/offline sections
- Search friends by username
- Challenge friends to games
- View friend profiles

### LeaderboardView
- Global/Friends/Club leaderboard tabs
- Time control filtering (blitz, rapid, classical)
- Highlights current user
- Displays rank, rating, games, win rate

### ClubsView
- My clubs section
- Discover new clubs
- Join/leave clubs
- View club details
- *Currently using mock data*

### MessagesView
- Conversation list
- Search conversations
- Unread message badges
- Direct messages and club chats
- *Currently using mock data*

## Hooks

### useFriends(userId)
Fetches friends list from account-api.

```tsx
const { friends, loading, error, refetch, challengeFriend } = useFriends(userId);
```

### useLeaderboard(type, timeControl)
Fetches leaderboard data from rating-api.

```tsx
const { entries, loading, error, refetch } = useLeaderboard('global', 'blitz');
```

### useSocialStats(userId)
Aggregates social statistics for hub view.

```tsx
const { stats, loading, error, refetch } = useSocialStats(userId);
```

## API Integration

### account-api
```typescript
// Friends
GET /api/v1/friends/:userId
POST /api/v1/friends/:userId/challenge

// Friend Requests (future)
GET /api/v1/friend-requests/:userId
POST /api/v1/friend-requests
```

### rating-api
```typescript
// Leaderboards
GET /api/v1/leaderboard?type=global&timeControl=blitz&limit=50
```

### Future APIs

**clubs-api** (not yet implemented):
```typescript
GET /api/v1/clubs/:userId
GET /api/v1/clubs/discover
POST /api/v1/clubs/:clubId/join
```

**messaging-api** (not yet implemented):
```typescript
GET /api/v1/conversations/:userId
GET /api/v1/conversations/:conversationId/messages
POST /api/v1/messages
```

## Testing

```bash
# Run all social feature tests
pnpm test features/social

# Run specific test suite
pnpm test features/social/hooks/useFriends.test.ts
```

## Migration Notes

### Before (social.tsx)
- 790 lines of monolithic code
- Hardcoded mock data
- No service integration
- All logic in one file

### After (features/social/)
- ~25 line tab wrapper
- Modular feature architecture
- Real API integration (friends, leaderboards)
- Separation of concerns
- Reusable components and hooks
- Mock data only for unavailable services

## Future Enhancements

- [ ] Implement clubs-api integration
- [ ] Implement messaging-api integration
- [ ] Add friend request management UI
- [ ] Add push notifications for messages
- [ ] Add club tournaments and events
- [ ] Add social achievements and badges
- [ ] Add player blocking/reporting
- [ ] Add privacy settings

## Related Documentation

- [App Architecture](../../docs/folder-structure-convention.md)
- [API Integration Guide](../../services/api/README.md)
- [Settings Feature](../settings/README.md) - Similar pattern
