import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { VStack, HStack, Text, Card, Button } from '@/ui';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { type ColorPalette } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';

export const AppearancePanel: React.FC = () => {
  const { mode, setMode, palette, setPalette, colors } = useThemeTokens();

  const palettes: { value: ColorPalette; label: string; preview: string }[] = [
    { value: 'orange', label: 'Orange', preview: '#EA580C' },
    { value: 'blue', label: 'Blue', preview: '#0284C7' },
    { value: 'purple', label: 'Purple', preview: '#7C3AED' },
  ];

  const themeModes: { value: 'light' | 'dark' | 'auto'; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <VStack gap={6} fullWidth padding={4}>
      {/* Theme Mode Selection */}
      <Card variant="elevated" size="md">
        <VStack gap={3}>
          <Text variant="title" weight="semibold">
            Theme Mode
          </Text>
          <Text variant="caption" color={colors.foreground.secondary}>
            Choose light, dark, or automatic theme
          </Text>
          <HStack gap={3}>
            {themeModes.map((tm) => (
              <Button
                key={tm.value}
                variant={mode === tm.value ? 'solid' : 'outline'}
                onPress={() => setMode(tm.value)}
                style={{ flex: 1 }}
              >
                {tm.label}
              </Button>
            ))}
          </HStack>
        </VStack>
      </Card>

      {/* Color Palette Selection */}
      <Card variant="elevated" size="md">
        <VStack gap={3}>
          <Text variant="title" weight="semibold">
            Color Palette
          </Text>
          <Text variant="caption" color={colors.foreground.secondary}>
            Choose your accent color palette
          </Text>
          <HStack gap={3}>
            {palettes.map((p) => (
              <Pressable
                key={p.value}
                onPress={() => setPalette(p.value)}
                style={[
                  styles.paletteCard,
                  {
                    borderColor: palette === p.value ? colors.accent.primary : colors.border,
                    borderWidth: palette === p.value ? 2 : 1,
                    backgroundColor: palette === p.value ? colors.accentSubtle : colors.background.card,
                  },
                ]}
              >
                <View
                  style={[
                    styles.palettePreview,
                    {
                      backgroundColor: p.preview,
                    },
                  ]}
                />
                <Text
                  variant="label"
                  weight={palette === p.value ? 'semibold' : 'medium'}
                  color={palette === p.value ? colors.accent.primary : colors.foreground.secondary}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
};

const styles = StyleSheet.create({
  paletteCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacingTokens[4],
    borderRadius: radiusTokens.lg,
    gap: spacingTokens[2],
  },
  palettePreview: {
    width: 48,
    height: 48,
    borderRadius: radiusTokens.md,
  },
});

export default AppearancePanel;
