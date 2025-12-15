import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, InteractivePressable, useThemeTokens, Button, Text, Box } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useMatchmaking } from '@/contexts/MatchmakingContext';
import { useI18n } from '@/i18n/I18nContext';
import { spacingTokens } from '@/ui/tokens/spacing';
import { entranceAnimations } from '@/ui/animations/presets';

type TimeControl = '1+0' | '3+0' | '5+0' | '10+0' | '15+10' | '30+0';

export default function OnlinePlayScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { isAuthenticated } = useAuth();
  const { joinQueue, leaveQueue, queueStatus } = useMatchmaking();

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
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Navigate if queue status indicates a match or if matchmaking provides a navigation callback.
    // For now this effect is left intentionally empty; matchmaking flow should call navigation via context or a callback.
  }, [router]);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <VStack flex={1} justifyContent="center" alignItems="center" padding={6} gap={4}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text variant="heading" weight="bold">
            {t('game_modes.finding_opponent')}
          </Text>
          <Text variant="body" color={colors.foreground.secondary}>
            {ti('game_modes.players_online', { count: queueStatus?.playersInQueue || 0 })}
          </Text>
          <Text variant="caption" color={colors.foreground.muted}>
            {ti('game_modes.searching_for', { seconds: queueStatus?.waitTime || 0 })}
          </Text>
          <Button variant="destructive" size="md" onPress={handleCancelSearch}>
            {t('game_modes.cancel_search')}
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacingTokens[9] }} showsVerticalScrollIndicator={false}>
        <VStack
          gap={6}
          style={{
            paddingHorizontal: spacingTokens[6],
            paddingTop: spacingTokens[6],
            maxWidth: 600,
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <Animated.View entering={FadeInUp.delay(100).duration(entranceAnimations.fadeInUp.config.duration ?? 400)}>
            <VStack gap={2} alignItems="center">
              <Text variant="heading" weight="bold" style={{ letterSpacing: -0.5 }} color={colors.accent.primary}>
                {t('game_modes.online_play')}
              </Text>
              <Text variant="body" color={colors.foreground.secondary}>
                {t('game_modes.choose_game_speed')}
              </Text>
            </VStack>
          </Animated.View>

          <VStack gap={3} marginTop={2}>
            {TIME_CONTROLS.map((tc, idx) => (
              <Animated.View
                key={tc.id}
                entering={FadeInDown.delay(200 + idx * 80).duration(entranceAnimations.fadeInDown.config.duration ?? 400)}
              >
                <InteractivePressable onPress={() => setTimeControl(tc.id)}>
                  <Panel
                    variant="glass"
                    padding={5}
                    style={[
                      { borderWidth: timeControl === tc.id ? 2 : 0, borderColor: colors.accent.primary },
                    ]}
                  >
                    <HStack gap={4} alignItems="center">
                      <Box
                        width={spacingTokens[8]}
                        height={spacingTokens[8]}
                        radius="full"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={colors.translucent.light}
                      >
                        <Text variant="title">{tc.label.split(' ')[0]}</Text>
                      </Box>
                      <VStack gap={1} flex={1}>
                        <Text variant="title" weight="bold" color={colors.foreground.primary} style={{ letterSpacing: -0.4 }}>
                          {tc.label}
                        </Text>
                        <Text variant="caption" weight="semibold" color={colors.foreground.muted} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {tc.type.charAt(0).toUpperCase() + tc.type.slice(1)}
                        </Text>
                      </VStack>
                      {timeControl === tc.id && (
                        <Text variant="title" weight="bold" color={colors.accent.primary}>
                          ✓
                        </Text>
                      )}
                    </HStack>
                  </Panel>
                </InteractivePressable>
              </Animated.View>
            ))}
          </VStack>

          <Animated.View entering={FadeInUp.delay(700).duration(entranceAnimations.fadeInUp.config.duration ?? 400)}>
            <Button size="lg" onPress={handleFindMatch}>
              {t('game_modes.find_match')}
            </Button>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
