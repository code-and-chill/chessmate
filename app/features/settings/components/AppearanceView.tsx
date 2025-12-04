/**
 * Appearance View Component
 * features/settings/components/AppearanceView.tsx
 */

import { ScrollView, TouchableOpacity } from 'react-native';
import { VStack, Card, Text, HStack, useColors, spacingTokens, typographyTokens } from '@/ui';

export interface AppearanceViewProps {
  onBack: () => void;
  userId: string;
}

export function AppearanceView({ onBack }: AppearanceViewProps) {
  const colors = useColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <VStack padding={spacingTokens[5]} gap={spacingTokens[4]}>
        <TouchableOpacity 
          style={{ alignSelf: 'flex-start', paddingVertical: spacingTokens[2], paddingHorizontal: spacingTokens[3] }}
          onPress={onBack}
        >
          <Text variant="body" color={colors.accent.primary}>← Back</Text>
        </TouchableOpacity>

        <VStack gap={spacingTokens[2]}>
          <Text variant="h2" color={colors.foreground.primary}>Appearance</Text>
          <Text variant="body" color={colors.foreground.secondary}>Personalize your interface</Text>
        </VStack>

        {/* Theme */}
        <Card variant="default" size="md">
          <VStack gap={spacingTokens[4]}>
            <Text variant="h4" color={colors.foreground.primary}>Theme</Text>
            <HStack gap={spacingTokens[3]}>
              <TouchableOpacity 
                style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  padding: spacingTokens[4], 
                  backgroundColor: `${colors.accent.primary}1A`, 
                  borderRadius: 10, 
                  borderWidth: 2, 
                  borderColor: colors.accent.primary 
                }}
              >
                <Text style={{ fontSize: typographyTokens.fontSize['3xl'], marginBottom: spacingTokens[2] }}>☀️</Text>
                <Text variant="bodyMedium" weight="semibold" color={colors.foreground.primary}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  padding: spacingTokens[4], 
                  backgroundColor: colors.background.tertiary, 
                  borderRadius: 10, 
                  borderWidth: 2, 
                  borderColor: 'transparent' 
                }}
              >
                <Text style={{ fontSize: typographyTokens.fontSize['3xl'], marginBottom: spacingTokens[2] }}>🌙</Text>
                <Text variant="bodyMedium" weight="semibold" color={colors.foreground.primary}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  padding: spacingTokens[4], 
                  backgroundColor: colors.background.tertiary, 
                  borderRadius: 10, 
                  borderWidth: 2, 
                  borderColor: 'transparent' 
                }}
              >
                <Text style={{ fontSize: typographyTokens.fontSize['3xl'], marginBottom: spacingTokens[2] }}>⚙️</Text>
                <Text variant="bodyMedium" weight="semibold" color={colors.foreground.primary}>Auto</Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </Card>

        {/* Display */}
        <Card variant="default" size="md">
          <VStack gap={spacingTokens[4]}>
            <Text variant="h4" color={colors.foreground.primary}>Display</Text>
            <PreferenceRow label="Language" value="English" />
            <PreferenceRow label="Time Format" value="12-hour" />
            <PreferenceRow label="Notation Style" value="Algebraic" />
            <PreferenceRow label="Font Size" value="Medium" />
          </VStack>
        </Card>

        {/* Chess Board Theme */}
        <Card variant="default" size="md">
          <VStack gap={spacingTokens[4]}>
            <Text variant="h4" color={colors.foreground.primary}>Chess Board</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('Navigating to board theme...');
                // Use router from expo-router
                const { router } = require('expo-router');
                router.push('/settings/board-theme');
              }}
              style={{ 
                paddingVertical: spacingTokens[3],
                borderBottomWidth: 1, 
                borderBottomColor: colors.border 
              }}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <Text variant="body" color={colors.foreground.primary}>Board Theme & Pieces</Text>
                <Text variant="bodyMedium" weight="semibold" color={colors.accent.primary}>Configure →</Text>
              </HStack>
            </TouchableOpacity>
          </VStack>
        </Card>

        {/* Accessibility */}
        <Card variant="default" size="md">
          <VStack gap={spacingTokens[4]}>
            <Text variant="h4" color={colors.foreground.primary}>Accessibility</Text>
            <PreferenceRow label="High Contrast" value="Off" />
            <PreferenceRow label="Reduce Motion" value="Off" />
            <PreferenceRow label="Screen Reader" value="Off" />
            <PreferenceRow label="Large Text" value="Off" />
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();

  return (
    <HStack 
      justifyContent="space-between" 
      alignItems="center" 
      paddingVertical={spacingTokens[3]}
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <Text variant="body" color={colors.foreground.primary}>{label}</Text>
      <Text variant="bodyMedium" weight="semibold" color={colors.accent.primary}>{value}</Text>
    </HStack>
  );
}
