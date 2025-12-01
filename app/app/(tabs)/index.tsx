import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Platform, Dimensions, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { PlayScreen } from '@/features/board';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack } from '@/ui';

type PlayMode = 'hub' | 'online' | 'bot' | 'friend' | 'game';
type TimeControl = '3+0' | '10+0' | '15+10' | '30+0' | 'daily';

const { width } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width >= 1024;

export default function PlayTab() {
  const [mode, setMode] = useState<PlayMode>('hub');
  const [gameId, setGameId] = useState('game-demo-1');
  const [loading, setLoading] = useState(false);
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');

  // Game screen
  if (mode === 'game') {
    return (
      <View style={styles.container}>
        <PlayScreen gameId={gameId} />
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loaderText}>Setting up your game...</Text>
      </View>
    );
  }

  // Play Hub
  if (mode === 'hub') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gradientBg} />
        <VStack gap={8} style={[styles.content, isDesktop ? styles.contentDesktop : undefined]}>
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <VStack gap={3} style={styles.headerSection}>
              <Text style={styles.title}>Play Chess</Text>
              <Text style={styles.subtitle}>Choose your game mode to get started</Text>
            </VStack>
          </Animated.View>

          <VStack gap={4} style={styles.cardsContainer}>
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Card
                variant="elevated"
                size="lg"
                hoverable
                pressable
                style={styles.modeCard}
              >
                <TouchableOpacity
                  style={styles.modeCardInner}
                  onPress={() => setMode('online')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modeIcon}>🌐</Text>
                  <VStack gap={1}>
                    <Text style={styles.modeTitle}>Online Play</Text>
                    <Text style={styles.modeDescription}>Find opponents worldwide</Text>
                  </VStack>
                </TouchableOpacity>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(300)}>
              <Card
                variant="elevated"
                size="lg"
                hoverable
                pressable
                style={styles.modeCard}
              >
                <TouchableOpacity
                  style={styles.modeCardInner}
                  onPress={() => setMode('bot')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modeIcon}>🤖</Text>
                  <VStack gap={1}>
                    <Text style={styles.modeTitle}>Play vs Bot</Text>
                    <Text style={styles.modeDescription}>Practice with AI opponents</Text>
                  </VStack>
                </TouchableOpacity>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(400)}>
              <Card
                variant="elevated"
                size="lg"
                hoverable
                pressable
                style={styles.modeCard}
              >
                <TouchableOpacity
                  style={styles.modeCardInner}
                  onPress={() => setMode('friend')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modeIcon}>👥</Text>
                  <VStack gap={1}>
                    <Text style={styles.modeTitle}>Friend Challenge</Text>
                    <Text style={styles.modeDescription}>Invite and play with friends</Text>
                  </VStack>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  // Online matchmaking
  if (mode === 'online') {
    return (
      <SafeAreaView style={styles.container}>
        <VStack style={styles.content} gap={6}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Online Play</Text>
            <Text style={styles.subtitle}>Choose your game speed</Text>
          </VStack>

          <VStack gap={3} style={{ marginTop: 8 }}>
            {(['3+0', '10+0', '15+10', '30+0'] as TimeControl[]).map((tc, idx) => (
              <Animated.View
                key={tc}
                entering={FadeInDown.delay(idx * 100).duration(400).springify()}
              >
                <Card
                  variant={timeControl === tc ? 'gradient' : 'default'}
                  size="md"
                  hoverable
                  pressable
                  animated
                >
                  <TouchableOpacity
                    style={[styles.timeControlButton, timeControl === tc ? styles.timeControlSelected : null]}
                    onPress={() => setTimeControl(tc)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.timeControlText, timeControl === tc ? styles.timeControlTextSelected : null]}>
                      {tc === '3+0' && '⚡ Blitz 3 min'}
                      {tc === '10+0' && '⏱️ Rapid 10 min'}
                      {tc === '15+10' && '⏱️ Rapid 15|10'}
                      {tc === '30+0' && '🐢 Classical 30 min'}
                    </Text>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            ))}
          </VStack>

          <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  setGameId(`game-online-${Date.now()}`);
                  setMode('game');
                  setLoading(false);
                }, 1500);
              }}
            >
              <Text style={styles.buttonText}>Find Match</Text>
            </TouchableOpacity>
          </Animated.View>
        </VStack>
      </SafeAreaView>
    );
  }

  // Bot selection
  if (mode === 'bot') {
    return (
      <SafeAreaView style={styles.container}>
        <VStack style={styles.content} gap={6}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Play vs Bot</Text>
            <Text style={styles.subtitle}>Choose your opponent's strength</Text>
          </VStack>

          <VStack gap={3} style={{ marginTop: 8 }}>
            {['Easy', 'Medium', 'Hard', 'Expert'].map((difficulty, idx) => (
              <Animated.View
                key={difficulty}
                entering={FadeInDown.delay(idx * 100).duration(400).springify()}
              >
                <Card
                  variant="elevated"
                  size="md"
                  hoverable
                  pressable
                  animated
                >
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setGameId(`game-bot-${difficulty.toLowerCase()}-${Date.now()}`);
                        setMode('game');
                        setLoading(false);
                      }, 500);
                    }}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.buttonText}>
                      {difficulty === 'Easy' && '🌱 Easy (800-1200)'}
                      {difficulty === 'Medium' && '🎯 Medium (1200-1600)'}
                      {difficulty === 'Hard' && '🔥 Hard (1600-2000)'}
                      {difficulty === 'Expert' && '👑 Expert (2000+)'}
                    </Text>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            ))}
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  // Friend challenge
  if (mode === 'friend') {
    return (
      <SafeAreaView style={styles.container}>
        <VStack style={styles.content} gap={6}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Friend Challenge</Text>
            <Text style={styles.subtitle}>Create or join a game</Text>
          </VStack>

          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
            <Card variant="elevated" size="lg">
              <VStack gap={4}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter game ID (e.g., game-demo-1)"
                  placeholderTextColor="#9CA3AF"
                  value={gameId}
                  onChangeText={setGameId}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setMode('game');
                      setLoading(false);
                    }, 500);
                  }}
                >
                  <Text style={styles.buttonText}>Join Game</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.demoButton]}
                  onPress={() => {
                    setGameId('game-demo-1');
                    setLoading(true);
                    setTimeout(() => {
                      setMode('game');
                      setLoading(false);
                    }, 500);
                  }}
                >
                  <Text style={styles.buttonText}>Try Demo Game</Text>
                </TouchableOpacity>
              </VStack>
            </Card>
          </Animated.View>
        </VStack>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  contentDesktop: {
    maxWidth: 800,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#667EEA',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
  },
  modeCard: {
    width: '100%',
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 4,
  },
  modeIcon: {
    fontSize: 48,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 0,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  demoButton: {
    backgroundColor: '#8B5CF6',
  },
  botButton: {
    backgroundColor: '#F59E0B',
  },
  friendButton: {
    backgroundColor: '#10B981',
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    color: '#667EEA',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeControlButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  timeControlSelected: {
    borderColor: '#667EEA',
    backgroundColor: '#F5F7FF',
    ...Platform.select({
      ios: {
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  timeControlText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
  },
  timeControlTextSelected: {
    color: '#667EEA',
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 17,
    color: '#6B7280',
    fontWeight: '500',
  },
});
