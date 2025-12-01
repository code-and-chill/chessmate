/**
 * Play Feature - Main Screen
 * features/play/components/PlayScreen.tsx
 */

import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PlayScreen as BoardPlayScreen } from '@/features/board';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { PlayMode, TimeControl } from '../types/play.types';
import { PlayHub } from './PlayHub';
import { OnlineMode } from './OnlineMode';
import { BotMode } from './BotMode';
import { FriendMode } from './FriendMode';

export type PlayScreenProps = {
  initialMode?: PlayMode;
};

export const PlayScreen: React.FC<PlayScreenProps> = ({ initialMode = 'hub' }) => {
  const [mode, setMode] = useState<PlayMode>(initialMode);
  const [gameId, setGameId] = useState('game-demo-1');
  const [loading, setLoading] = useState(false);
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
  };

  // Game screen
  if (mode === 'game') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <BoardPlayScreen gameId={gameId} />
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={getColor(colorTokens.blue[600], isDark)} />
        <Text variant="body" color={colors.foreground} style={{ marginTop: spacingTokens[4] }}>
          Setting up your game...
        </Text>
      </View>
    );
  }

  // Route to correct subscreen
  if (mode === 'hub') {
    return <PlayHub onSelectMode={setMode} />;
  }

  if (mode === 'online') {
    return (
      <OnlineMode
        timeControl={timeControl}
        onChangeTimeControl={setTimeControl}
        onBack={() => setMode('hub')}
        onStartGame={(tc) => {
          setTimeControl(tc);
          setLoading(true);
          setTimeout(() => {
            setGameId(`game-online-${Date.now()}`);
            setMode('game');
            setLoading(false);
          }, 1500);
        }}
      />
    );
  }

  if (mode === 'bot') {
    return (
      <BotMode
        onBack={() => setMode('hub')}
        onStartGame={(botLevel) => {
          setLoading(true);
          setTimeout(() => {
            setGameId(`game-bot-${botLevel}-${Date.now()}`);
            setMode('game');
            setLoading(false);
          }, 1000);
        }}
      />
    );
  }

  if (mode === 'friend') {
    return (
      <FriendMode
        onBack={() => setMode('hub')}
        onStartGame={(friendId) => {
          setLoading(true);
          setTimeout(() => {
            setGameId(`game-friend-${friendId}-${Date.now()}`);
            setMode('game');
            setLoading(false);
          }, 1000);
        }}
      />
    );
  }

  return null;
};
