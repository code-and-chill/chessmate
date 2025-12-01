/**
 * Social Hub Component
 * features/social/components/SocialHub.tsx
 */

import { ScrollView, View } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Card } from '@/ui/primitives/Card';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { SocialMode } from '../types/social.types';
import { SocialCard } from './SocialCard';

export type SocialHubProps = {
  onSelectMode: (mode: SocialMode) => void;
};

export const SocialHub: React.FC<SocialHubProps> = ({ onSelectMode }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6] }} gap={6}>
        <VStack gap={2}>
          <Text variant="heading" color={colors.foreground}>
            Social
          </Text>
          <Text variant="body" color={colors.secondary}>
            Connect with the chess community
          </Text>
        </VStack>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: spacingTokens[3] }}>
          <Card variant="default" size="sm" style={{ flex: 1 }}>
            <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
              <Text variant="title" color={colors.foreground}>12</Text>
              <Text variant="caption" color={colors.secondary}>Online Friends</Text>
            </VStack>
          </Card>
          <Card variant="default" size="sm" style={{ flex: 1 }}>
            <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
              <Text variant="title" color={colors.foreground}>3</Text>
              <Text variant="caption" color={colors.secondary}>Clubs</Text>
            </VStack>
          </Card>
          <Card variant="default" size="sm" style={{ flex: 1 }}>
            <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
              <Text variant="title" color={colors.foreground}>5</Text>
              <Text variant="caption" color={colors.secondary}>Unread</Text>
            </VStack>
          </Card>
        </View>

        <VStack gap={4}>
          <SocialCard
            icon="👥"
            title="Friends"
            description="See who's online • Challenge friends • View profiles"
            info="45 friends • 12 online"
            onPress={() => onSelectMode('friends')}
          />
          <SocialCard
            icon="🏆"
            title="Clubs"
            description="Join communities • Participate in tournaments"
            info="3 clubs • 2 active tournaments"
            onPress={() => onSelectMode('clubs')}
          />
          <SocialCard
            icon="💬"
            title="Messages"
            description="Chat with friends • Game invites"
            info="5 unread messages"
            onPress={() => onSelectMode('chat')}
          />
          <SocialCard
            icon="🏅"
            title="Leaderboards"
            description="Rankings • Compare with friends"
            info="Global rank: #1,234"
            onPress={() => onSelectMode('leaderboard')}
          />
        </VStack>
      </VStack>
    </ScrollView>
  );
};
