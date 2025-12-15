import React from 'react';
import { SafeAreaView } from 'react-native';
import { Box, Text, useThemeTokens } from '@/ui';

export default function LiveGameExampleScreen() {
  const { colors } = useThemeTokens();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Box padding={6} gap={2}>
        <Text variant="title" weight="bold">
          Live Game Example
        </Text>
        <Text variant="body" color={colors.foreground.secondary}>
          Example live game UI moved into feature slice.
        </Text>
      </Box>
    </SafeAreaView>
  );
}
