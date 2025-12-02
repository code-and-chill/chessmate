/**
 * Messages View Component (Placeholder)
 * features/social/components/MessagesView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeTokens } from '@/ui';
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.messages')}</Text>
      <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{ti('social.unread_messages', { count: 5 })}</Text>

      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }]}
        placeholder={t('social.search_conversations')}
        placeholderTextColor={colors.foreground.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {conversations.map(conv => (
        <ChatPreview key={conv.id} {...conv} colors={colors} />
      ))}
    </ScrollView>
  );
}

function ChatPreview({ name, lastMessage, time, unread, avatar, colors }: any) {
  return (
    <TouchableOpacity style={[styles.chatPreview, { backgroundColor: colors.background.secondary }]}>
      <Text style={styles.chatAvatar}>{avatar}</Text>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: colors.foreground.primary }, unread > 0 && styles.chatNameUnread]}>{name}</Text>
          <Text style={[styles.chatTime, { color: colors.foreground.muted }]}>{time}</Text>
        </View>
        <Text style={[styles.chatMessage, { color: colors.foreground.secondary }, unread > 0 && { color: colors.foreground.primary, fontWeight: '500' }]} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
      {unread > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.accent.primary }]}>
          <Text style={[styles.unreadText, { color: colors.accentForeground.primary }]}>{unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  searchInput: { borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 16, borderWidth: 1 },
  chatPreview: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 16, marginBottom: 12, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  chatAvatar: { fontSize: 32, marginRight: 12 },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: '500' },
  chatNameUnread: { fontWeight: '700' },
  chatTime: { fontSize: 12 },
  chatMessage: { fontSize: 14 },
  unreadBadge: { borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginLeft: 8 },
  unreadText: { fontSize: 12, fontWeight: '700' },
});
