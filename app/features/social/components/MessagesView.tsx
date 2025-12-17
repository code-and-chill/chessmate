import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text, Input, InteractivePressable, useThemeTokens, HStack, VStack } from '@/ui';
import { shadowTokens } from '@/ui/tokens/shadows';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { useI18n } from '@/i18n/I18nContext';
import { useConversations } from '../hooks';

export interface MessagesViewProps {
  onBack: () => void;
  userId: string;
}

export function MessagesView({ onBack }: MessagesViewProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { conversations, loading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {ti('social.unread_messages', { count: conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) })}
        </Text>
      </VStack>

      <Input
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('social.search_conversations')}
        placeholderTextColor={colors.foreground.muted}
        variant="default"
      />

      {loading ? (
        <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
          {t('social.loading_messages', 'Loading messages...')}
        </Text>
      ) : (
        <VStack gap={3} marginTop={3}>
          {filteredConversations.length === 0 ? (
            <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
              {t('social.no_conversations', 'No conversations found')}
            </Text>
          ) : (
            filteredConversations.map(conv => (
              <ChatPreview key={conv.id} conversation={conv} colors={colors} />
            ))
          )}
        </VStack>
      )}
    </ScrollView>
  );
}

function ChatPreview({ conversation, colors }: { conversation: import('@/types/social').Conversation; colors: any }) {
  const unread = conversation.unreadCount || 0;
  const name = conversation.participant?.username || 'Unknown';
  const lastMessage = conversation.lastMessage?.content || 'No messages yet';
  const time = conversation.lastMessage?.sentAt
    ? new Date(conversation.lastMessage.sentAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const avatar = conversation.participant?.username?.[0]?.toUpperCase() || '?';

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
