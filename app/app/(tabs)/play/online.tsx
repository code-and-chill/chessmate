import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Card,
  Button,
  Text,
  LoadingState,
  VStack,
  spacingScale,
  spacingTokens,
  textVariants,
  radiusTokens,
} from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useMatchmaking } from '@/contexts/MatchmakingContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

type TimeControl = '1+0' | '3+0' | '5+0' | '10+0' | '15+10' | '30+0';

export default function OnlinePlayScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { isAuthenticated } = useAuth();
  const { joinQueue, leaveQueue, queueStatus, matchFound } = useMatchmaking();
  
  const TIME_CONTROLS = [
    { id: '1+0' as TimeControl, label: `⚡ ${t('game_modes.bullet_1min')}`, type: 'bullet' },
    { id: '3+0' as TimeControl, label: `⚡ ${t('game_modes.blitz_3min')}`, type: 'blitz' },
    { id: '5+0' as TimeControl, label: `⚡ ${t('game_modes.blitz_5min')}`, type: 'blitz' },
    { id: '10+0' as TimeControl, label: `⏱️ ${t('game_modes.rapid_10min')}`, type: 'rapid' },
    { id: '15+10' as TimeControl, label: `⏱️ ${t('game_modes.rapid_15_10')}`, type: 'rapid' },
    { id: '30+0' as TimeControl, label: `🐢 ${t('game_modes.classical_30min')}`, type: 'classical' },
  ];
  
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (matchFound) {
      router.push(`/game/${matchFound.gameId}`);
    }
  }, [matchFound]);

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      await joinQueue({
        timeControl,
        ratingRange: { min: 0, max: 3000 }, // Open rating range for now
      });
    } catch (error) {
      console.error('Failed to join queue:', error);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    try {
      await leaveQueue();
      setIsSearching(false);
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  if (isSearching) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.searchingContainer}>
          <LoadingState size="large" />
          
          <Text
            {...textVariants.title}
            color={colors.foreground.primary}
            style={{ marginTop: spacingScale.lg }}
          >
            {t('game_modes.finding_opponent')}
          </Text>
          
          <Text
            {...textVariants.body}
            color={colors.foreground.secondary}
            style={{ marginTop: spacingTokens[2] }}
          >
            {ti('game_modes.players_online', { count: queueStatus?.playersInQueue || 0 })}
          </Text>
          
          <Text
            {...textVariants.caption}
            color={colors.foreground.muted}
            style={{ marginTop: spacingTokens[1] }}
          >
            {ti('game_modes.searching_for', { seconds: queueStatus?.waitTime || 0 })}
          </Text>
          
          <Button
            variant="destructive"
            size="lg"
            onPress={handleCancelSearch}
            style={{ marginTop: spacingScale.xxl, minWidth: 200 }}
          >
            {t('game_modes.cancel_search')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={spacingScale.lg}>
        <VStack gap={spacingTokens[2]} style={{ alignItems: 'center' }}>
          <Text
            {...textVariants.display}
            color={colors.foreground.primary}
          >
            {t('game_modes.online_play')}
          </Text>
          <Text
            {...textVariants.body}
            color={colors.foreground.secondary}
          >
            {t('game_modes.choose_game_speed')}
          </Text>
        </VStack>

        <VStack gap={spacingTokens[3]} style={{ marginTop: spacingTokens[2] }}>
          {TIME_CONTROLS.map((tc, idx) => (
            <Animated.View
              key={tc.id}
              entering={FadeInDown.delay(idx * 100).duration(400).springify()}
            >
              <Card
                variant={timeControl === tc.id ? 'elevated' : 'default'}
                size="md"
                hoverable
                pressable
                animated
                style={timeControl === tc.id ? styles.selectedCard : undefined}
                onPress={() => setTimeControl(tc.id)}
              >
                <Text
                  {...textVariants.titleSmall}
                  color={colors.foreground.primary}
                  style={{ textAlign: 'center' }}
                >
                  {tc.label}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </VStack>

        <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleFindMatch}
            animated
          >
            {t('game_modes.find_match')}
          </Button>
        </Animated.View>
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
    paddingHorizontal: spacingScale.gutter,
    paddingTop: spacingScale.gutter,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingScale.gutter,
  },
});
