import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useSocial } from '@/contexts/SocialContext';
import type { Conversation, Message } from '@/contexts/SocialContext';

export default function MessagesScreen() {
  const router = useRouter();
  const { getConversations, getMessages, sendMessage, markAsRead, isLoading } = useSocial();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const data = await getConversations();
    setConversations(data);
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    const msgs = await getMessages(conv.id);
    setMessages(msgs);
    
    // Mark as read
    if (conv.unreadCount > 0) {
      await markAsRead(conv.id);
      loadConversations(); // Refresh to update unread count
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation.otherUserId, messageText);
    
    // Reload messages
    const msgs = await getMessages(selectedConversation.id);
    setMessages(msgs);
    setMessageText('');
  };

  const renderConversationCard = ({ item, index }: { item: Conversation; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(400)}>
      <TouchableOpacity onPress={() => selectConversation(item)}>
        <Card variant="default" size="md" style={{ marginBottom: 8 }}>
          <View style={styles.conversationCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.otherUsername[0].toUpperCase()}</Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName}>{item.otherUsername}</Text>
                {item.isOnline && <View style={styles.onlineBadge} />}
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </VStack>
            <VStack gap={1} style={{ alignItems: 'flex-end' }}>
              <Text style={styles.timestamp}>
                {new Date(item.lastMessageTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </VStack>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === 'current-user-id'; // TODO: Replace with actual user ID
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 20).duration(300)}
        style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}
      >
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={90}
        >
          <VStack style={styles.chatContainer} gap={0}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                onPress={() => setSelectedConversation(null)}
                style={styles.backButton}
              >
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {selectedConversation.otherUsername[0].toUpperCase()}
                </Text>
              </View>
              <VStack gap={0} style={{ flex: 1 }}>
                <Text style={styles.chatHeaderName}>{selectedConversation.otherUsername}</Text>
                {selectedConversation.isOnline && (
                  <Text style={styles.chatHeaderStatus}>Online</Text>
                )}
              </VStack>
            </View>

            {/* Messages List */}
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              inverted
            />

            {/* Input Bar */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#64748B"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </VStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VStack style={styles.content} gap={6}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
            <Text style={styles.backTextTop}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} unread
          </Text>
        </Animated.View>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Card variant="default" size="md">
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyText}>
                  Start a conversation with your friends
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/social/friends')}
                >
                  <Text style={styles.emptyButtonText}>View Friends</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButtonTop: {
    marginBottom: 12,
  },
  backTextTop: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  lastMessage: {
    fontSize: 14,
    color: '#94A3B8',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#667EEA',
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#10B981',
  },
  messagesList: {
    padding: 16,
    flexDirection: 'column-reverse',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#667EEA',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  ownMessageTime: {
    color: '#E0E7FF',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#667EEA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
