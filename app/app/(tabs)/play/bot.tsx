import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, Icon } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

type BotDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export default function BotPlayScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { createBotGame, isCreatingGame } = useGame();
  
  const BOT_LEVELS = [
    { id: 'beginner' as BotDifficulty, label: t('game_modes.beginner'), icon: 'person' as const, rating: 400, description: t('game_modes.perfect_for_learning') },
    { id: 'easy' as BotDifficulty, label: t('game_modes.easy'), icon: 'person' as const, rating: 800, description: t('game_modes.casual_play') },
    { id: 'medium' as BotDifficulty, label: t('game_modes.intermediate'), icon: 'target' as const, rating: 1200, description: t('game_modes.good_challenge') },
    { id: 'hard' as BotDifficulty, label: t('game_modes.advanced'), icon: 'bolt' as const, rating: 1600, description: t('game_modes.strong_opponent') },
    { id: 'expert' as BotDifficulty, label: t('game_modes.master'), icon: 'flame' as const, rating: 2000, description: t('game_modes.very_difficult') },
    { id: 'master' as BotDifficulty, label: t('game_modes.grandmaster'), icon: 'trophy' as const, rating: 2400, description: t('game_modes.grandmaster_level') },
  ];
  
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('random');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleStartGame = async () => {
    try {
      const gameId = await createBotGame({
        difficulty,
        playerColor: playerColor === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : playerColor,
      });
      
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to create bot game:', error);
    }
  };

  if (isCreatingGame) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>
            {t('game_modes.preparing_game')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={2} style={{ alignItems: 'center' }}>
              <Text style={[styles.title, { color: colors.accent.primary }]}>
                {t('game_modes.play_vs_bot')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
                {t('game_modes.choose_opponent_strength')}
              </Text>
            </VStack>
          </Animated.View>

          {/* Bot Levels */}
          <VStack gap={3} style={{ marginTop: 8 }}>
            {BOT_LEVELS.map((bot, idx) => (
              <Animated.View
                key={bot.id}
                entering={FadeInDown.delay(200 + idx * 80).duration(400)}
              >
                <TouchableOpacity
                  onPress={() => setDifficulty(bot.id)}
                  activeOpacity={0.9}
                >
                  <Panel
                    variant="glass"
                    padding={20}
                    style={[
                      styles.botCard,
                      ... (difficulty === bot.id ? [styles.selectedCard] : []),
                    ]}
                  >
                    <HStack gap={4} style={{ alignItems: 'center' }}>
                      <View style={[styles.botBadge, { backgroundColor: colors.translucent.light }]}>
                        <Icon name={bot.icon} size={24} color={colors.foreground.primary} />
                      </View>
                      <VStack gap={1} style={{ flex: 1 }}>
                        <Text style={[styles.botTitle, { color: colors.foreground.primary }]}>
                          {bot.label}
                        </Text>
                        <Text style={[styles.botDescription, { color: colors.foreground.secondary }]}>
                          {bot.description}
                        </Text>
                        <Text style={[styles.botRating, { color: colors.foreground.muted }]}>
                          Rating: {bot.rating}
                        </Text>
                      </VStack>
                      {difficulty === bot.id && (
                        <Text style={[styles.checkmark, { color: colors.accent.primary, textAlignVertical: 'center', includeFontPadding: false }]}>✓</Text>
                      )}
                    </HStack>
                  </Panel>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </VStack>

          {/* Color Selection */}
          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <Panel variant="glass" padding={20}>
              <VStack gap={3}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  {t('game_modes.play_as')}
                </Text>
                <HStack gap={3}>
                  {(['white', 'black', 'random'] as const).map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        {
                          backgroundColor: playerColor === color
                            ? colors.translucent.medium
                            : colors.background.secondary,
                          borderColor: playerColor === color ? colors.accent.primary : 'transparent',
                        },
                      ]}
                      onPress={() => setPlayerColor(color)}
                      activeOpacity={0.7}
                    >
                      <HStack gap={2} alignItems="center">
                        {color === 'white' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border }} />}
                        {color === 'black' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#000000' }} />}
                        {color === 'random' && <Icon name="bolt" size={14} color={playerColor === color ? colors.accent.primary : colors.foreground.secondary} />}
                        <Text
                          style={[
                            styles.colorButtonText,
                            {
                              color: playerColor === color
                                ? colors.accent.primary
                                : colors.foreground.secondary,
                            },
                          ]}
                        >
                          {color === 'white' && t('game_modes.white')}
                          {color === 'black' && t('game_modes.black')}
                          {color === 'random' && t('game_modes.random')}
                        </Text>
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </VStack>
            </Panel>
          </Animated.View>

          {/* Start Game Button */}
          <Animated.View entering={FadeInUp.delay(800).duration(400)}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent.primary }]}
              onPress={handleStartGame}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t('game_modes.start_game')}</Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 24,
  },
  botCard: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#667EEA',
  },
  botBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botIcon: {
    // Removed - using Icon component instead
  },
  botTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  botDescription: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 2,
  },
  botRating: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  colorButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  colorButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 17,
    marginTop: 20,
    fontWeight: '500',
  },
});
