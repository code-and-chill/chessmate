/**
 * Settings Hub Component
 * features/settings/components/SettingsHub.tsx
 */

import { ScrollView, View } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Card } from '@/ui/primitives/Card';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { SettingsMode } from '../types/settings.types';
import { SettingsCard } from './SettingsCard';

export type SettingsHubProps = {
  onSelectMode: (mode: SettingsMode) => void;
};

export const SettingsHub: React.FC<SettingsHubProps> = ({ onSelectMode }) => {
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
            Profile & Settings
          </Text>
          <Text variant="body" color={colors.secondary}>
            Customize your chess experience
          </Text>
        </VStack>

        {/* Profile Card */}
        <Card variant="elevated" size="md">
          <View style={{ padding: spacingTokens[5], flexDirection: 'row', alignItems: 'center', gap: spacingTokens[4] }}>
            <Text style={{ fontSize: 48 }}>♔</Text>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text variant="title" color={colors.foreground}>ChessPlayer2025</Text>
              <Text variant="caption" color={colors.secondary}>player@chess.com</Text>
              <Text variant="caption" color={colors.secondary}>Member since Nov 2025</Text>
            </VStack>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: spacingTokens[3] }}>
          <Card variant="default" size="sm" style={{ flex: 1 }}>
            <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
              <Text variant="title" color={colors.foreground}>1650</Text>
              <Text variant="caption" color={colors.secondary}>Blitz Rating</Text>
            </VStack>
          </Card>
          <Card variant="default" size="sm" style={{ flex: 1 }}>
            <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
              <Text variant="title" color={colors.foreground}>456</Text>
              <Text variant="caption" color={colors.secondary}>Games Played</Text>
            </VStack>
          </Card>
          <Card variant="default" size="sm" style={{ flex: 1 }}>
            <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
              <Text variant="title" color={colors.foreground}>54%</Text>
              <Text variant="caption" color={colors.secondary}>Win Rate</Text>
            </VStack>
          </Card>
        </View>

        <VStack gap={4}>
          <SettingsCard
            icon="👤"
            title="Profile"
            description="Edit profile • Change avatar • Bio"
            onPress={() => onSelectMode('profile')}
          />
          <SettingsCard
            icon="📊"
            title="Statistics"
            description="Detailed stats • Performance graphs"
            onPress={() => onSelectMode('stats')}
          />
          <SettingsCard
            icon="🏆"
            title="Achievements"
            description="View badges • Track progress"
            onPress={() => onSelectMode('achievements')}
          />
          <SettingsCard
            icon="⚙️"
            title="Preferences"
            description="Game settings • Notifications"
            onPress={() => onSelectMode('preferences')}
          />
          <SettingsCard
            icon="🎨"
            title="Appearance"
            description="Themes • Board customization"
            onPress={() => onSelectMode('appearance')}
          />
        </VStack>
      </VStack>
    </ScrollView>
  );
};
