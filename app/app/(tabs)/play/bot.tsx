import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

type BotDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

const BOT_LEVELS = [
  { id: 'beginner' as BotDifficulty, label: '👶 Beginner', rating: 400, description: 'Perfect for learning' },
  { id: 'easy' as BotDifficulty, label: '😊 Easy', rating: 800, description: 'Casual play' },
  { id: 'medium' as BotDifficulty, label: '🎯 Intermediate', rating: 1200, description: 'Good challenge' },
  { id: 'hard' as BotDifficulty, label: '💪 Advanced', rating: 1600, description: 'Strong opponent' },
  { id: 'expert' as BotDifficulty, label: '🔥 Expert', rating: 2000, description: 'Very difficult' },
  { id: 'master' as BotDifficulty, label: '🏆 Master', rating: 2400, description: 'Grandmaster level' },
];

export default function BotPlayScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { createBotGame, isCreatingGame } = useGame();
  
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Preparing your game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VStack style={styles.content} gap={6}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Play vs Bot</Text>
          <Text style={styles.subtitle}>Choose your opponent's strength</Text>
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
                    <Text style={[styles.botLabel, difficulty === bot.id && styles.selectedText]}>
                      {bot.label}
                    </Text>
                    <Text style={[styles.botDescription, difficulty === bot.id && styles.selectedText]}>
                      {bot.description}
                    </Text>
                  </View>
                  <Text style={[styles.botRating, difficulty === bot.id && styles.selectedText]}>
                    {bot.rating}
                  </Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          ))}
        </VStack>

        <Animated.View entering={FadeInUp.delay(600).duration(400).springify()}>
          <VStack gap={2} style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>Play as:</Text>
            <View style={styles.colorSelector}>
              {(['white', 'black', 'random'] as const).map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    playerColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setPlayerColor(color)}
                >
                  <Text
                    style={[
                      styles.colorButtonText,
                      playerColor === color && styles.colorButtonTextSelected,
                    ]}
                  >
                    {color === 'white' && '⚪ White'}
                    {color === 'black' && '⚫ Black'}
                    {color === 'random' && '🎲 Random'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(400).springify()}>
          <TouchableOpacity style={styles.button} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </Animated.View>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  botDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  botRating: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  colorButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  colorButtonTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#667EEA',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
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
    color: '#94A3B8',
    marginTop: 16,
  },
});
