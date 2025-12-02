import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
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
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.searchingTitle, { color: colors.foreground.primary }]}>{t('game_modes.finding_opponent')}</Text>
          <Text style={[styles.searchingSubtitle, { color: colors.foreground.secondary }]}>
            {ti('game_modes.players_online', { count: queueStatus?.playersInQueue || 0 })}
          </Text>
          <Text style={[styles.searchingTime, { color: colors.foreground.muted }]}>
            {ti('game_modes.searching_for', { seconds: queueStatus?.waitTime || 0 })}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.error }]}
            onPress={handleCancelSearch}
          >
            <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>{t('game_modes.cancel_search')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={6}>
        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('game_modes.online_play')}</Text>
          <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('game_modes.choose_game_speed')}</Text>
        </VStack>

        <VStack gap={3} style={{ marginTop: 8 }}>
          {TIME_CONTROLS.map((tc, idx) => (
            <Animated.View
              key={tc.id}
              entering={FadeInDown.delay(idx * 100).duration(400).springify()}
            >
              <Card
                variant={timeControl === tc.id ? 'gradient' : 'default'}
                size="md"
                hoverable
                pressable
                animated
              >
                <TouchableOpacity
                  style={[
                    styles.timeControlButton,
                    timeControl === tc.id ? styles.timeControlSelected : null,
                  ]}
                  onPress={() => setTimeControl(tc.id)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.timeControlText,
                      { color: colors.foreground.primary },
                    ]}
                  >
                    {tc.label}
                  </Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          ))}
        </VStack>

        <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent.primary }]} onPress={handleFindMatch}>
            <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>{t('game_modes.find_match')}</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  timeControlButton: {
    padding: 16,
  },
  timeControlSelected: {
    // Additional styling when selected
  },
  timeControlText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  timeControlTextSelected: {
    // Additional styling when selected
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  searchingSubtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  searchingTime: {
    fontSize: 14,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 32,
    minWidth: 200,
  },
});
