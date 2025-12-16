import {useEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {useRouter} from 'expo-router';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import {Card} from '@/ui/primitives/Card';
import {VStack} from '@/ui/primitives/Stack';
import {useThemeTokens} from '@/ui/hooks/useThemeTokens';
import {useSocial} from '@/contexts/SocialContext';
import {Conversation, Message} from "@/types/social";

export default function MessagesScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { getConversations, getConversation, sendMessage, markAsRead, isLoading } = useSocial();
  
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
    
    // Get full conversation with messages
    const fullConv = await getConversation(conv.participant.id);
    setMessages(fullConv.messages);
    
    // Mark as read
    if (conv.unreadCount > 0) {
      await markAsRead(conv.id);
      loadConversations(); // Refresh to update unread count
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation.participant.id, messageText);
    
    // Reload messages
    const fullConv = await getConversation(selectedConversation.participant.id);
    setMessages(fullConv.messages);
    setMessageText('');
  };

  const renderConversationCard = ({ item, index }: { item: Conversation; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(400)}>
      <TouchableOpacity onPress={() => selectConversation(item)}>
        <Card variant="default" size="md" style={{ marginBottom: 8 }}>
          <View style={styles.conversationCard}>
            <View style={[styles.avatar, { backgroundColor: colors.accent.primary }]}>
              <Text style={[styles.avatarText, { color: colors.accentForeground.primary }]}>
                {item.participant?.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <View style={styles.conversationHeader}>
                <Text style={[styles.conversationName, { color: colors.foreground.primary }]}>
                  {item.participant?.username || 'Unknown'}
                </Text>
                {item.participant?.online && <View style={[styles.onlineBadge, { backgroundColor: colors.success }]} />}
              </View>
              <Text style={[styles.lastMessage, { color: colors.foreground.secondary }]} numberOfLines={1}>
                {item.lastMessage?.content || 'No messages yet'}
              </Text>
            </VStack>
            <VStack gap={1} style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.timestamp, { color: colors.foreground.muted }]}>
                {item.lastMessage?.sentAt ? new Date(item.lastMessage.sentAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) : ''}
              </Text>
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.accent.primary }]}>
                  <Text style={[styles.unreadText, { color: colors.accentForeground.primary }]}>
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </VStack>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.from === 'current-user-id'; // TODO: Replace with actual user ID from auth context
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 20).duration(300)}
        style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}
      >
        <View style={[
          styles.messageBubble, 
          isOwn ? { backgroundColor: colors.accent.primary } : { backgroundColor: colors.background.secondary }
        ]}>
          <Text style={[
            styles.messageText, 
            { color: isOwn ? colors.accentForeground.primary : colors.foreground.primary }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime, 
            { color: isOwn ? colors.accentForeground.primary + '99' : colors.foreground.muted }
          ]}>
            {new Date(item.sentAt).toLocaleTimeString('en-US', {
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
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
                <Text style={[styles.backText, { color: colors.accent.primary }]}>←</Text>
              </TouchableOpacity>
              <View style={[styles.avatar, { backgroundColor: colors.accent.primary }]}>
                <Text style={[styles.avatarText, { color: colors.accentForeground.primary }]}>
                  {selectedConversation.participant?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <VStack gap={0} style={{ flex: 1 }}>
                <Text style={[styles.chatHeaderName, { color: colors.foreground.primary }]}>
                  {selectedConversation.participant?.username || 'Unknown'}
                </Text>
                {selectedConversation.participant?.online && (
                  <Text style={[styles.chatHeaderStatus, { color: colors.success }]}>Online</Text>
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
            <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.background.tertiary,
                  color: colors.foreground.primary,
                }]}
                placeholder="Type a message..."
                placeholderTextColor={colors.foreground.muted}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton, 
                  { backgroundColor: colors.accent.primary },
                  !messageText.trim() && { opacity: 0.5 }
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Text style={[styles.sendButtonText, { color: colors.accentForeground.primary }]}>➤</Text>
              </TouchableOpacity>
            </View>
          </VStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={6}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>Messages</Text>
          <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} unread
          </Text>
        </Animated.View>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Card variant="default" size="md">
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground.primary }]}>No messages yet</Text>
                <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
                  Start a conversation with your friends
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.accent.primary }]}
                  onPress={() => router.push('/social/friends')}
                >
                  <Text style={[styles.emptyButtonText, { color: colors.accentForeground.primary }]}>View Friends</Text>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatHeaderStatus: {
    fontSize: 12,
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
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
