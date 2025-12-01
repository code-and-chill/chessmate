import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, TextInput, Share } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

type ChallengeMode = 'create' | 'join';

export default function FriendChallengeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { createFriendGame, joinFriendGame, isCreatingGame } = useGame();
  
  const [mode, setMode] = useState<ChallengeMode>('create');
  const [gameLink, setGameLink] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [timeControl, setTimeControl] = useState<string>('10+0');
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('random');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleCreateChallenge = async () => {
    try {
      const challenge = await createFriendGame({
        timeControl,
        playerColor: playerColor === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : playerColor,
        creatorId: user?.id || '',
      });
      
      const link = `chessmate://game/${challenge.gameId}?code=${challenge.inviteCode}`;
      setGameLink(link);
      
      // Option to share
      await Share.share({
        message: `Play chess with me! ${link}`,
        title: 'Chess Challenge',
      });
    } catch (error) {
      console.error('Failed to create friend game:', error);
    }
  };

  const handleJoinChallenge = async () => {
    if (!joinCode.trim()) {
      return;
    }
    
    try {
      const gameId = await joinFriendGame(joinCode);
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to join friend game:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <VStack style={styles.content} gap={6}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Friend Challenge</Text>
          <Text style={styles.subtitle}>Play with your friends</Text>
        </VStack>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
            onPress={() => setMode('create')}
          >
            <Text style={[styles.modeButtonText, mode === 'create' && styles.modeButtonTextActive]}>
              Create Challenge
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
            onPress={() => setMode('join')}
          >
            <Text style={[styles.modeButtonText, mode === 'join' && styles.modeButtonTextActive]}>
              Join Challenge
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
            <VStack gap={4}>
              {/* Time Control */}
              <VStack gap={2}>
                <Text style={styles.label}>Time Control</Text>
                <View style={styles.timeControlGrid}>
                  {['1+0', '3+0', '5+0', '10+0', '15+10', '30+0'].map((tc) => (
                    <TouchableOpacity
                      key={tc}
                      style={[
                        styles.timeControlChip,
                        timeControl === tc && styles.timeControlChipActive,
                      ]}
                      onPress={() => setTimeControl(tc)}
                    >
                      <Text
                        style={[
                          styles.timeControlChipText,
                          timeControl === tc && styles.timeControlChipTextActive,
                        ]}
                      >
                        {tc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </VStack>

              {/* Color Selection */}
              <VStack gap={2}>
                <Text style={styles.label}>Play as:</Text>
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

              {/* Create Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateChallenge}
                disabled={isCreatingGame}
              >
                <Text style={styles.buttonText}>
                  {isCreatingGame ? 'Creating...' : 'Create & Share Link'}
                </Text>
              </TouchableOpacity>

              {gameLink && (
                <Card variant="default" size="md">
                  <VStack gap={2} style={{ padding: 16 }}>
                    <Text style={styles.label}>Challenge Link Created!</Text>
                    <Text style={styles.linkText} numberOfLines={1}>
                      {gameLink}
                    </Text>
                    <Text style={styles.hint}>
                      Share this link with your friend to start the game
                    </Text>
                  </VStack>
                </Card>
              )}
            </VStack>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
            <VStack gap={4}>
              <Card variant="default" size="md">
                <VStack gap={3} style={{ padding: 16 }}>
                  <Text style={styles.label}>Enter Challenge Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste code or link here"
                    placeholderTextColor="#64748B"
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.hint}>
                    Your friend will share a code or link with you
                  </Text>
                </VStack>
              </Card>

              <TouchableOpacity
                style={styles.button}
                onPress={handleJoinChallenge}
                disabled={!joinCode.trim() || isCreatingGame}
              >
                <Text style={styles.buttonText}>
                  {isCreatingGame ? 'Joining...' : 'Join Game'}
                </Text>
              </TouchableOpacity>
            </VStack>
          </Animated.View>
        )}
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
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  modeButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeControlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeControlChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeControlChipActive: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  timeControlChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  timeControlChipTextActive: {
    color: '#FFFFFF',
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
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#667EEA',
    fontFamily: 'monospace',
  },
});
