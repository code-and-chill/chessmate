import { useState } from 'react';
import { SocialHub, FriendsView, ClubsView, MessagesView, LeaderboardView } from '../components';
import type { SocialMode } from '@/types/social';

export interface SocialScreenProps {
  userId: string;
}

export function SocialScreen({ userId }: SocialScreenProps) {
  const [mode, setMode] = useState<SocialMode>('hub');

  switch (mode) {
    case 'friends':
      return <FriendsView onBack={() => setMode('hub')} userId={userId} />;
    case 'clubs':
      return <ClubsView onBack={() => setMode('hub')} userId={userId} />;
    case 'messages':
      return <MessagesView onBack={() => setMode('hub')} userId={userId} />;
    case 'leaderboard':
      return <LeaderboardView onBack={() => setMode('hub')} />;
    case 'hub':
    default:
      return <SocialHub onNavigate={setMode} userId={userId} />;
  }
}
