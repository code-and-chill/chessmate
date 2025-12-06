import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack } from '@/ui';
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
        ratingRange: { min: 0, max: 3000 },
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

          <Text style={[styles.searchingTitle, { color: colors.foreground.primary, marginTop: 20 }]}> 
            {t('game_modes.finding_opponent')}
          </Text>

          <Text style={[styles.searchingText, { color: colors.foreground.secondary, marginTop: 8 }]}> 
            {ti('game_modes.players_online', { count: queueStatus?.playersInQueue || 0 })}
          </Text>

          <Text style={[styles.searchingHint, { color: colors.foreground.muted, marginTop: 4 }]}> 
            {ti('game_modes.searching_for', { seconds: queueStatus?.waitTime || 0 })}
          </Text>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#EF4444', marginTop: 32 }]}
            onPress={handleCancelSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>{t('game_modes.cancel_search')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={2} style={{ alignItems: 'center' }}>
              <Text style={[styles.title, { color: colors.accent.primary }]}>
                {t('game_modes.online_play')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}> {t('game_modes.choose_game_speed')} </Text>
            </VStack>
          </Animated.View>

          <VStack gap={3} style={{ marginTop: 8 }}>
            {TIME_CONTROLS.map((tc, idx) => (
              <Animated.View key={tc.id} entering={FadeInDown.delay(200 + idx * 80).duration(400)}>
                <TouchableOpacity onPress={() => setTimeControl(tc.id)} activeOpacity={0.9}>
                  <Panel variant="glass" padding={20} style={[styles.timeControlCard, timeControl === tc.id && styles.selectedCard]}> 
                    <HStack gap={4} style={{ alignItems: 'center' }}>
                      <View style={[styles.timeBadge, { backgroundColor: colors.translucent.light }]}> 
                        <Text style={styles.timeIcon}>{tc.label.split(' ')[0]}</Text>
                      </View>
                      <VStack gap={1} style={{ flex: 1 }}>
                        <Text style={[styles.timeTitle, { color: colors.foreground.primary }]}>{tc.label}</Text>
                        <Text style={[styles.timeType, { color: colors.foreground.muted }]}>{tc.type.charAt(0).toUpperCase() + tc.type.slice(1)}</Text>
                      </VStack>
                      {timeControl === tc.id && <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>}
                    </HStack>
                  </Panel>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </VStack>

          <Animated.View entering={FadeInUp.delay(700).duration(400)}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent.primary }]} onPress={handleFindMatch} activeOpacity={0.8}>
              <Text style={styles.buttonText}>{t('game_modes.find_match')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  content: { paddingHorizontal: 24, paddingTop: 24, maxWidth: 600, alignSelf: 'center', width: '100%' },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 17, textAlign: 'center', marginTop: 6, fontWeight: '500', lineHeight: 24 },
  timeControlCard: { shadowColor: '#667EEA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  selectedCard: { borderWidth: 2, borderColor: '#667EEA' },
  timeBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  timeIcon: { fontSize: 28 },
  timeTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  timeType: { fontSize: 13, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  checkmark: { fontSize: 24, fontWeight: 'bold' },
  button: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  searchingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  searchingTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  searchingText: { fontSize: 17, fontWeight: '500', textAlign: 'center' },
  searchingHint: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  cancelButton: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, minWidth: 200, alignItems: 'center' },
  cancelButtonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
