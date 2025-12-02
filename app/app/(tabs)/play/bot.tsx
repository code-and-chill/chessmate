import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
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
    { id: 'beginner' as BotDifficulty, label: `👶 ${t('game_modes.beginner')}`, rating: 400, description: t('game_modes.perfect_for_learning') },
    { id: 'easy' as BotDifficulty, label: `😊 ${t('game_modes.easy')}`, rating: 800, description: t('game_modes.casual_play') },
    { id: 'medium' as BotDifficulty, label: `🎯 ${t('game_modes.intermediate')}`, rating: 1200, description: t('game_modes.good_challenge') },
    { id: 'hard' as BotDifficulty, label: `💪 ${t('game_modes.advanced')}`, rating: 1600, description: t('game_modes.strong_opponent') },
    { id: 'expert' as BotDifficulty, label: `🔥 ${t('game_modes.expert')}`, rating: 2000, description: t('game_modes.very_difficult') },
    { id: 'master' as BotDifficulty, label: `🏆 ${t('game_modes.master')}`, rating: 2400, description: t('game_modes.grandmaster_level') },
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
          <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>{t('game_modes.preparing_game')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={6}>
        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('game_modes.play_vs_bot')}</Text>
          <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('game_modes.choose_opponent_strength')}</Text>
        </VStack>

        <VStack gap={3} style={{ marginTop: 8 }}>
          {BOT_LEVELS.map((bot, idx) => (
            <Animated.View
              key={bot.id}
              entering={FadeInDown.delay(idx * 80).duration(400).springify()}
            >
              <Card
                variant={difficulty === bot.id ? 'gradient' : 'default'}
                size="md"
                hoverable
                pressable
                animated
              >
                <TouchableOpacity
                  style={styles.botButton}
                  onPress={() => setDifficulty(bot.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.botInfo}>
                    <Text style={[styles.botLabel, { color: colors.foreground.primary }]}>
                      {bot.label}
                    </Text>
                    <Text style={[styles.botDescription, { color: colors.foreground.secondary }]}>
                      {bot.description}
                    </Text>
                  </View>
                  <Text style={[styles.botRating, { color: colors.foreground.muted }]}>
                    {bot.rating}
                  </Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          ))}
        </VStack>

        <Animated.View entering={FadeInUp.delay(600).duration(400).springify()}>
          <VStack gap={2} style={{ marginTop: 16 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground.secondary }]}>{t('game_modes.play_as')}</Text>
            <View style={styles.colorSelector}>
              {(['white', 'black', 'random'] as const).map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { 
                      backgroundColor: colors.background.secondary,
                      borderColor: playerColor === color ? colors.accent.primary : 'transparent',
                    },
                    playerColor === color && { backgroundColor: colors.background.tertiary },
                  ]}
                  onPress={() => setPlayerColor(color)}
                >
                  <Text
                    style={[
                      styles.colorButtonText,
                      { color: playerColor === color ? colors.foreground.primary : colors.foreground.secondary },
                    ]}
                  >
                    {color === 'white' && `⚪ ${t('game_modes.white')}`}
                    {color === 'black' && `⚫ ${t('game_modes.black')}`}
                    {color === 'random' && `🎲 ${t('game_modes.random')}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(400).springify()}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent.primary }]} onPress={handleStartGame}>
            <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>{t('game_modes.start_game')}</Text>
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
  botButton: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botInfo: {
    flex: 1,
  },
  botLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  botDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  botRating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  colorButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  colorButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
});
