/**
 * Friends View Component  
 * features/social/components/FriendsView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} contentContainerStyle={styles.content}>

      <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.friends')}</Text>
      <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
        {ti('social.friend_count', { count: friends.length })} • {ti('social.online_count', { count: onlineFriends.length })}
      </Text>

      {/* Search */}
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }]}
        placeholder={t('social.search_friends')}
        placeholderTextColor={colors.foreground.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Add Friend Button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent.primary }]}>
        <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>+ {t('social.add_friend')}</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>{t('social.loading_friends')}</Text>
      ) : (
        <>
          {/* Online Friends */}
          {onlineFriends.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{ti('social.online_now', { count: onlineFriends.length })}</Text>
              {onlineFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} onChallenge={challengeFriend} colors={colors} />
              ))}
            </View>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t('social.offline')}</Text>
              {offlineFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} onChallenge={challengeFriend} colors={colors} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

interface FriendCardProps {
  friend: Friend;
  onChallenge: (friendId: string) => void;
  colors: any;
}

function FriendCard({ friend, onChallenge, colors }: FriendCardProps) {
  return (
    <View style={[styles.friendCard, { backgroundColor: colors.background.secondary }]}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>{friend.avatar}</Text>
        <View style={styles.friendDetails}>
          <View style={styles.friendNameRow}>
            <Text style={[styles.friendName, { color: colors.foreground.primary }]}>{friend.username}</Text>
            {friend.online && <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />}
          </View>
          <Text style={[styles.friendRating, { color: colors.foreground.secondary }]}>
            {friend.rating} • {friend.online ? (friend.playing ? t('social.playing') : t('social.online')) : friend.lastSeen}
          </Text>
        </View>
      </View>
      {friend.online && !friend.playing && (
        <TouchableOpacity style={[styles.challengeButton, { backgroundColor: colors.accent.primary }]} onPress={() => onChallenge(friend.id)}>
          <Text style={[styles.challengeButtonText, { color: colors.accentForeground.primary }]}>{t('social.challenge')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  searchInput: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  categorySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  friendRating: {
    fontSize: 13,
  },
  challengeButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  challengeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
