import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  VStack, 
  HStack, 
  Text, 
  Button, 
  useThemeTokens,
  Box,
  Icon,
  Grid,
  SelectionCard,
} from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useMatchmaking } from '@/contexts/MatchmakingContext';
import { useI18n } from '@/i18n/I18nContext';
import { spacingScale, spacingTokens } from '@/ui/tokens/spacing';

type TimeControl = '1+0' | '3+0' | '5+0' | '10+0' | '15+10' | '30+0';

interface TimeControlOption {
  id: TimeControl;
  label: string;
  type: 'bullet' | 'blitz' | 'rapid' | 'classical';
  icon: string;
}

export default function OnlinePlayScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const { t, ti } = useI18n();
  const { isAuthenticated } = useAuth();
  const { joinQueue, leaveQueue, queueStatus } = useMatchmaking();

  const TIME_CONTROLS: TimeControlOption[] = useMemo(() => [
    { id: '1+0', label: t('game_modes.bullet_1min'), type: 'bullet', icon: '⚡' },
    { id: '3+0', label: t('game_modes.blitz_3min'), type: 'blitz', icon: '⚡' },
    { id: '5+0', label: t('game_modes.blitz_5min'), type: 'blitz', icon: '⚡' },
    { id: '10+0', label: t('game_modes.rapid_10min'), type: 'rapid', icon: '⏱️' },
    { id: '15+10', label: t('game_modes.rapid_15_10'), type: 'rapid', icon: '⏱️' },
    { id: '30+0', label: t('game_modes.classical_30min'), type: 'classical', icon: '🐢' },
  ], [t]);
  
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

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

  // Responsive layout - consistent with bot.tsx
  const gridColumns = width < 500 ? 1 : 2;
  const maxWidth = gridColumns === 1 ? 400 : Math.min(700, width - spacingTokens[6] * 2);

  const getTypeColor = (type: TimeControlOption['type']) => {
    switch (type) {
      case 'bullet':
        return colors.warning;
      case 'blitz':
        return colors.accent.primary;
      case 'rapid':
        return colors.info;
      case 'classical':
        return colors.success;
      default:
        return colors.accent.primary;
    }
  };

  if (isSearching) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <VStack 
          flex={1} 
          justifyContent="center" 
          alignItems="center" 
          gap={spacingTokens[4]}
          style={{ paddingHorizontal: spacingTokens[6] }}
        >
          <Animated.View entering={FadeInUp.duration(400)}>
            <Box
              width={80}
              height={80}
              radius="full"
              alignItems="center"
              justifyContent="center"
              backgroundColor={colors.accent.primary + '15'}
            >
              <ActivityIndicator size="large" color={colors.accent.primary} />
            </Box>
          </Animated.View>
          
          <VStack gap={spacingTokens[2]} alignItems="center" style={{ maxWidth: 400 }}>
            <Text variant="title" weight="bold" style={{ color: colors.foreground.primary }}>
              {t('game_modes.finding_opponent')}
            </Text>
            <Text variant="body" style={{ color: colors.foreground.secondary, textAlign: 'center' }}>
              {ti('game_modes.players_online', { count: queueStatus?.playersInQueue || 0 })}
            </Text>
            <Text variant="caption" style={{ color: colors.foreground.tertiary, textAlign: 'center' }}>
              {ti('game_modes.searching_for', { seconds: queueStatus?.waitTime || 0 })}
            </Text>
          </VStack>

          <Button 
            variant="outline" 
            size="md" 
            onPress={handleCancelSearch}
            style={styles.cancelButton}
          >
            {t('game_modes.cancel_search')}
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VStack 
          gap={spacingTokens[5]} 
          style={[
            styles.content,
            { 
              paddingHorizontal: spacingScale.gutter,
              paddingTop: spacingTokens[4],
              paddingBottom: spacingTokens[8],
              maxWidth,
            }
          ]}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={spacingTokens[2]} alignItems="center">
              <HStack gap={spacingTokens[2]} alignItems="center">
                <Box
                  width={48}
                  height={48}
                  radius="full"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={colors.accent.primary + '15'}
                >
                  <Icon name="globe" size={28} color={colors.accent.primary} />
                </Box>
                <Text variant="display" weight="bold" style={[styles.title, { color: colors.accent.primary }]}>
                  {t('game_modes.online_play')}
                </Text>
              </HStack>
              <Text variant="body" style={[styles.subtitle, { color: colors.foreground.secondary }]}>
                Find opponents and test your skills in real-time matches
              </Text>
            </VStack>
          </Animated.View>

          {/* Time Control Options - Grid Layout */}
          <VStack gap={spacingTokens[3]}>
            <Text variant="label" weight="semibold" style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
              {t('game_modes.time_control')}
            </Text>
            <Grid gap={spacingTokens[3]} columns={gridColumns}>
              {TIME_CONTROLS.map((tc, idx) => (
                <SelectionCard
                  key={tc.id}
                  label={tc.label}
                  subtitle={tc.type.toUpperCase()}
                  icon={tc.icon}
                  accentColor={getTypeColor(tc.type)}
                  isSelected={timeControl === tc.id}
                  onSelect={() => setTimeControl(tc.id)}
                  index={idx}
                  accessibilityLabel={`Select ${tc.label}`}
                />
              ))}
            </Grid>
          </VStack>

          {/* Find Match Button */}
          <Animated.View entering={FadeInUp.delay(700).duration(400)}>
            <Button 
              variant="primary" 
              size="lg" 
              onPress={handleFindMatch}
              style={styles.findMatchButton}
            >
              {t('game_modes.find_match')}
            </Button>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  findMatchButton: {
    width: '100%',
    marginTop: spacingTokens[2],
  },
  cancelButton: {
    minWidth: 200,
    marginTop: spacingTokens[4],
  },
});
