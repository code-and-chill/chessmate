/**
 * Social Feature - Main Screen
 * features/social/components/SocialScreen.tsx
 */

import { useState } from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { SocialMode } from '../types/social.types';
import { SocialHub } from './SocialHub';

export type SocialScreenProps = {
  initialMode?: SocialMode;
};

export const SocialScreen: React.FC<SocialScreenProps> = ({ initialMode = 'hub' }) => {
  const [mode, setMode] = useState<SocialMode>(initialMode);
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  if (mode === 'hub') {
    return <SocialHub onSelectMode={setMode} />;
  }

  // Placeholder for other modes
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6] }} gap={4}>
        <Text variant="heading" color={colors.foreground}>
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </Text>
        <Text variant="body" color={colors.secondary}>
          Coming soon...
        </Text>
      </VStack>
    </ScrollView>
  );
};
