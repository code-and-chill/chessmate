/**
 * Friends View Component  
 * features/social/components/FriendsView.tsx
 */

import { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, InteractivePressable, useThemeTokens, Text, Box, Button, Input } from '@/ui';
import { useFriends } from '../hooks';
import type { Friend } from '@/types/social';
import { useI18n } from '@/i18n/I18nContext';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacingTokens[5], paddingBottom: spacingTokens[9] }} showsVerticalScrollIndicator={false}>
        <VStack gap={6} style={{ paddingTop: spacingTokens[6], maxWidth: 600, alignSelf: 'center', width: '100%' }}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={2} style={{ marginBottom: spacingTokens[2] }}>
              <InteractivePressable onPress={onBack} style={{ alignSelf: 'flex-start', paddingVertical: spacingTokens[2] }}>
                <Text variant="label" weight="semibold" color={colors.accent.primary}>← {t('common.back')}</Text>
              </InteractivePressable>
              <Text variant="heading" weight="bold" style={{ letterSpacing: -0.5 }} color={colors.foreground.primary}>{t('social.friends')}</Text>
              <Text variant="body" color={colors.foreground.secondary}>
                {ti('social.friend_count', { count: friends.length })} • {ti('social.online_count', { count: onlineFriends.length })}
              </Text>
            </VStack>
          </Animated.View>

          {/* Search & Actions Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="gradient" size="md" padding={5}>
              <VStack gap={3}>
                <Input
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('social.search_friends')}
                  placeholderTextColor={colors.foreground.muted}
                  variant="default"
                />
                <Button onPress={() => { /* TODO add friend */ }}>
                  + {t('social.add_friend')}
                </Button>
              </VStack>
            </Card>
          </Animated.View>

          {loading ? (
            <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
              {t('social.loading_friends')}
            </Text>
          ) : (
            <>
              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <VStack gap={3}>
                  <Text variant="title" weight="bold" color={colors.foreground.primary}>
                    {ti('social.online_now', { count: onlineFriends.length })}
                  </Text>
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
                  <Text variant="title" weight="bold" color={colors.foreground.primary}>
                    {t('social.offline')} ({offlineFriends.length})
                  </Text>
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
    <Card variant="default" size="md" padding={4}>
      <HStack gap={3} alignItems="center" style={{ justifyContent: 'space-between' }}>
        <HStack gap={3} alignItems="center" style={{ flex: 1 }}>
          <Box
            width={spacingTokens[7]}
            height={spacingTokens[7]}
            radius="full"
            alignItems="center"
            justifyContent="center"
            backgroundColor={`${colors.accent.primary}15`}
          >
            <Text variant="title">{friend.avatar}</Text>
          </Box>
          <VStack gap={1} style={{ flex: 1 }}>
            <HStack gap={2} alignItems="center">
              <Text variant="body" weight="bold" color={colors.foreground.primary} style={{ letterSpacing: -0.2 }}>
                {friend.username}
              </Text>
              {friend.online && (
                <Box
                  width={spacingTokens[2]}
                  height={spacingTokens[2]}
                  radius="full"
                  backgroundColor={colors.success}
                />
              )}
            </HStack>
            <Text variant="caption" color={colors.foreground.secondary}>
              Rating: {friend.rating}
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              {friend.online ? (friend.playing ? '🎮 ' + t('social.playing') : '🟢 ' + t('social.online')) : '⏰ ' + friend.lastSeen}
            </Text>
          </VStack>
        </HStack>
        {friend.online && !friend.playing && (
          <Button size="sm" onPress={() => onChallenge(friend.id)}>
            ⚔️ {t('social.challenge')}
          </Button>
        )}
      </HStack>
    </Card>
  );
}
