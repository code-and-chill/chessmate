/**
 * Social Feature Public API
 * features/social/index.ts
 */

// Main screen
export { SocialScreen } from './screens/SocialScreen';

// Types
export type { SocialMode, Friend, Club, Conversation, LeaderboardEntry, SocialStats } from './types';

// Hooks (for advanced usage)
export { useFriends, useLeaderboard, useSocialStats } from './hooks';

// Components (for advanced usage)
export { SocialHub, FriendsView, ClubsView, MessagesView, LeaderboardView } from './components';
// Entry (app-level wrapper)
export { default as SocialEntry } from './SocialEntry';
