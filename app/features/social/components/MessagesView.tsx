/**
 * Messages View Component (Placeholder)
 * features/social/components/MessagesView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface MessagesViewProps {
  onBack: () => void;
  userId: string;
}

export function MessagesView({ onBack }: MessagesViewProps) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>5 unread messages</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search conversations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {conversations.map(conv => (
        <ChatPreview key={conv.id} {...conv} />
      ))}
    </ScrollView>
  );
}

function ChatPreview({ name, lastMessage, time, unread, avatar }: any) {
  return (
    <TouchableOpacity style={styles.chatPreview}>
      <Text style={styles.chatAvatar}>{avatar}</Text>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, unread > 0 && styles.chatNameUnread]}>{name}</Text>
          <Text style={styles.chatTime}>{time}</Text>
        </View>
        <Text style={[styles.chatMessage, unread > 0 && styles.chatMessageUnread]} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
      {unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 20 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16 },
  backButtonText: { fontSize: 16, color: '#FF9F0A' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  searchInput: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  chatPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  chatAvatar: { fontSize: 32, marginRight: 12 },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: '500', color: '#000' },
  chatNameUnread: { fontWeight: '700' },
  chatTime: { fontSize: 12, color: '#999' },
  chatMessage: { fontSize: 14, color: '#666' },
  chatMessageUnread: { color: '#000', fontWeight: '500' },
  unreadBadge: { backgroundColor: '#FF9F0A', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginLeft: 8 },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
