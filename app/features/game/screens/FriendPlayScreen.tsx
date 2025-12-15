import React from 'react';
import { SafeAreaView } from 'react-native';
import { Box, Text, useThemeTokens } from '@/ui';

export default function FriendPlayScreen() {
  const { colors } = useThemeTokens();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Box padding={6} gap={2}>
        <Text variant="title" weight="bold">
          Play with Friend
        </Text>
        <Text variant="body" color={colors.foreground.secondary}>
          Invite a friend or create a private game.
        </Text>
      </Box>
    </SafeAreaView>
  );
}
