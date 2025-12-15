import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text, Input, InteractivePressable, useThemeTokens, HStack, VStack } from '@/ui';
import { shadowTokens } from '@/ui/tokens/shadows';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { useI18n } from '@/i18n/I18nContext';

export interface MessagesViewProps {
  onBack: () => void;
  userId: string;
}

export function MessagesView({ onBack }: MessagesViewProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations - TODO: Create useConversations hook when messaging API is available
  const conversations = [
    { id: '1', name: 'ChessMaster99', lastMessage: 'Good game! Rematch?', time: '2m ago', unread: 2, avatar: '♔', type: 'direct' },
    { id: '2', name: 'Chess Enthusiasts', lastMessage: 'Sarah: Tournament starting soon!', time: '15m ago', unread: 5, avatar: '♔', type: 'club' },
    { id: '3', name: 'TacticsGuru', lastMessage: 'Check out this puzzle', time: '1h ago', unread: 0, avatar: '♕', type: 'direct' },
    { id: '4', name: 'Blitz Masters', lastMessage: 'Mike: Anyone up for 3+0?', time: '2h ago', unread: 0, avatar: '⚡', type: 'club' },
    { id: '5', name: 'BlitzQueen', lastMessage: 'Thanks for the tips!', time: '1d ago', unread: 0, avatar: '♛', type: 'direct' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      contentContainerStyle={{ padding: spacingTokens[5] }}
      showsVerticalScrollIndicator={false}
    >
      <VStack gap={2} marginBottom={3}>
        <Text variant="title" weight="bold">
          {t('social.messages')}
        </Text>
        <Text variant="body" color={colors.foreground.secondary}>
          {ti('social.unread_messages', { count: 5 })}
        </Text>
      </VStack>

      <Input
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('social.search_conversations')}
        placeholderTextColor={colors.foreground.muted}
        variant="default"
      />

      <VStack gap={3} marginTop={3}>
        {conversations.map(conv => (
          <ChatPreview key={conv.id} {...conv} colors={colors} />
        ))}
      </VStack>
    </ScrollView>
  );
}

function ChatPreview({ name, lastMessage, time, unread, avatar, colors }: any) {
  return (
    <InteractivePressable
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radiusTokens.md,
          padding: spacingTokens[4],
          backgroundColor: colors.background.secondary,
          marginBottom: spacingTokens[3],
          ...shadowTokens.sm,
        },
      ]}
      onPress={() => {
        /* open conversation */
      }}
    >
      <Text variant="title" style={{ marginRight: spacingTokens[3] }}>
        {avatar}
      </Text>
      <VStack style={{ flex: 1 }} gap={1}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text
            variant="label"
            weight={unread > 0 ? 'bold' : 'semibold'}
            color={colors.foreground.primary}
          >
            {name}
          </Text>
          <Text variant="caption" color={colors.foreground.muted}>
            {time}
          </Text>
        </HStack>
        <Text
          variant="body"
          numberOfLines={1}
          color={unread > 0 ? colors.foreground.primary : colors.foreground.secondary}
          weight={unread > 0 ? 'semibold' : undefined}
        >
          {lastMessage}
        </Text>
      </VStack>
      {unread > 0 && (
        <Box
          paddingX={3}
          height={spacingTokens[5]}
          minWidth={spacingTokens[5]}
          alignItems="center"
          justifyContent="center"
          radius="lg"
          backgroundColor={colors.accent.primary}
          style={{ marginLeft: spacingTokens[2] }}
        >
          <Text variant="caption" weight="bold" color={colors.accentForeground.primary}>
            {unread}
          </Text>
        </Box>
      )}
    </InteractivePressable>
  );
}
