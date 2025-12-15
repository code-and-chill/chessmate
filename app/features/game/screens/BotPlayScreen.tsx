import React from 'react';
import { SafeAreaView } from 'react-native';
import { Box, Text, useThemeTokens } from '@/ui';
import { spacingTokens } from '@/ui/tokens/spacing';

export default function BotPlayScreen() {
  const { colors } = useThemeTokens();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Box padding={6} gap={2}>
        <Text variant="title" weight="bold">
          Play vs Bot
        </Text>
        <Text variant="body" color={colors.foreground.secondary}>
          This feature is implemented in the game feature slice.
        </Text>
      </Box>
    </SafeAreaView>
  );
}
