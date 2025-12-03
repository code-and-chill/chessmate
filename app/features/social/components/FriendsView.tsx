/**
 * Friends View Component  
 * features/social/components/FriendsView.tsx
 */

import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack } from '@/ui';
import { useFriends } from '../hooks';
import type { Friend } from '../types';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export interface FriendsViewProps {
  onBack: () => void;
  userId: string;
}

export function FriendsView({ onBack, userId }: FriendsViewProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { friends, loading, challengeFriend } = useFriends(userId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const onlineFriends = filteredFriends.filter(f => f.online);
  const offlineFriends = filteredFriends.filter(f => !f.online);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={1} style={styles.header}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={[styles.backButtonText, { color: colors.accent.primary }]}>← {t('common.back')}</Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.friends')}</Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
                {ti('social.friend_count', { count: friends.length })} • {ti('social.online_count', { count: onlineFriends.length })}
              </Text>
            </VStack>
          </Animated.View>

          {/* Search & Actions Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="gradient" size="md" style={{ padding: 20 }}>
              <VStack gap={3}>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }]}
                  placeholder={t('social.search_friends')}
                  placeholderTextColor={colors.foreground.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent.primary }]}>
                  <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>+ {t('social.add_friend')}</Text>
                </TouchableOpacity>
              </VStack>
            </Card>
          </Animated.View>

          {loading ? (
            <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>{t('social.loading_friends')}</Text>
          ) : (
            <>
              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <VStack gap={3}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{ti('social.online_now', { count: onlineFriends.length })}</Text>
                  {onlineFriends.map((friend, index) => (
                    <Animated.View key={friend.id} entering={FadeInDown.delay(300 + index * 50).duration(400)}>
                      <FriendCard friend={friend} onChallenge={challengeFriend} colors={colors} />
                    </Animated.View>
                  ))}
                </VStack>
              )}

              {/* Offline Friends */}
              {offlineFriends.length > 0 && (
                <VStack gap={3}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t('social.offline')} ({offlineFriends.length})</Text>
                  {offlineFriends.map((friend, index) => (
                    <Animated.View key={friend.id} entering={FadeInDown.delay(400 + index * 50).duration(400)}>
                      <FriendCard friend={friend} onChallenge={challengeFriend} colors={colors} />
                    </Animated.View>
                  ))}
                </VStack>
              )}
            </>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FriendCardProps {
  friend: Friend;
  onChallenge: (friendId: string) => void;
  colors: ReturnType<typeof useThemeTokens>['colors'];
}

function FriendCard({ friend, onChallenge, colors }: FriendCardProps) {
  const { t } = useI18n();
  
  return (
    <Card variant="default" size="md">
      <View style={styles.friendCard}>
        <HStack gap={3} style={{ flex: 1, alignItems: 'center' }}>
          <View style={[styles.avatarBadge, { backgroundColor: colors.accent.primary + '15' }]}>
            <Text style={styles.friendAvatar}>{friend.avatar}</Text>
          </View>
          <VStack gap={1} style={{ flex: 1 }}>
            <HStack gap={2} style={{ alignItems: 'center' }}>
              <Text style={[styles.friendName, { color: colors.foreground.primary }]}>{friend.username}</Text>
              {friend.online && <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />}
            </HStack>
            <Text style={[styles.friendRating, { color: colors.foreground.secondary }]}>
              Rating: {friend.rating}
            </Text>
            <Text style={[styles.friendStatus, { color: colors.foreground.tertiary }]}>
              {friend.online ? (friend.playing ? '🎮 ' + t('social.playing') : '🟢 ' + t('social.online')) : '⏰ ' + friend.lastSeen}
            </Text>
          </VStack>
        </HStack>
        {friend.online && !friend.playing && (
          <TouchableOpacity 
            style={[styles.challengeButton, { backgroundColor: colors.accent.primary }]} 
            onPress={() => onChallenge(friend.id)}
          >
            <Text style={styles.challengeButtonText}>⚔️ {t('social.challenge')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  searchInput: {
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  addButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatar: {
    fontSize: 24,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  friendRating: {
    fontSize: 14,
    fontWeight: '500',
  },
  friendStatus: {
    fontSize: 13,
    fontWeight: '400',
  },
  challengeButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  challengeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
