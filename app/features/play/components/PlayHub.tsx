/**
 * Play Hub Component
 * features/play/components/PlayHub.tsx
 */

import { SafeAreaView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { PlayMode } from '../types/play.types';
import { ModeCard } from './ModeCard';

const { width } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width >= 1024;

export type PlayHubProps = {
  onSelectMode: (mode: PlayMode) => void;
};

export const PlayHub: React.FC<PlayHubProps> = ({ onSelectMode }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack gap={8} style={{ padding: spacingTokens[6], maxWidth: isDesktop ? 800 : undefined, alignSelf: 'center', width: '100%' }}>
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <VStack gap={3}>
            <Text variant="heading" color={colors.foreground}>
              Play Chess
            </Text>
            <Text variant="body" color={colors.secondary}>
              Choose your game mode to get started
            </Text>
          </VStack>
        </Animated.View>

        <VStack gap={4} style={{ marginTop: spacingTokens[4] }}>
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <ModeCard
              icon="🌐"
              title="Online Play"
              description="Find opponents worldwide"
              onPress={() => onSelectMode('online')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <ModeCard
              icon="🤖"
              title="Play vs Bot"
              description="Practice with AI opponents"
              onPress={() => onSelectMode('bot')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <ModeCard
              icon="👥"
              title="Friend Challenge"
              description="Invite and play with friends"
              onPress={() => onSelectMode('friend')}
            />
          </Animated.View>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};
