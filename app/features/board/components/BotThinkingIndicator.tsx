import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '@/ui/primitives/Text';
import { Box } from '@/ui/primitives/Box';
import { VStack } from '@/ui/primitives/Stack';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

interface BotThinkingIndicatorProps {
  visible: boolean;
  thinkingTime?: number;
}

export function BotThinkingIndicator({ visible, thinkingTime }: BotThinkingIndicatorProps) {
  const { colors } = useThemeTokens();

  if (!visible) return null;

  const thinkingTimeSeconds = thinkingTime ? Math.floor(thinkingTime / 1000) : 0;

  return (
    <View style={styles.container} pointerEvents="none">
      <Box
        backgroundColor={colors.background.secondary}
        borderRadius={8}
        padding={spacingTokens[3]}
        style={styles.indicator}
      >
        <VStack gap={spacingTokens[2]} alignItems="center">
          <ActivityIndicator size="small" color={colors.accent.primary} />
          <Text variant="body" style={{ color: colors.foreground.secondary }}>
            Bot is thinking...
          </Text>
          {thinkingTimeSeconds > 0 && (
            <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
              {thinkingTimeSeconds}s
            </Text>
          )}
        </VStack>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  indicator: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

