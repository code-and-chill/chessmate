import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, TextInput, Share } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

type ChallengeMode = 'create' | 'join' | 'local';

export default function FriendChallengeScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const { createFriendGame, joinFriendGame, isCreatingGame, createLocalGame } = useGame();
  
  const [mode, setMode] = useState<ChallengeMode>('local');
  const [gameLink, setGameLink] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [timeControl, setTimeControl] = useState<string>('10+0');
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('random');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleCreateLocalGame = async () => {
    try {
      const [initialMinutes, incrementSeconds] = timeControl.split('+').map(Number);
      const gameState = await createLocalGame({
        timeControl: {
          initialMs: initialMinutes * 60 * 1000,
          incrementMs: incrementSeconds * 1000,
        },
        colorPreference: playerColor,
        opponentAccountId: 'local',
      });
      
      router.push(`/game/${gameState.gameId}`);
    } catch (error) {
      console.error('Failed to create local game:', error);
    }
  };

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
        message: t('game_modes.play_chess_with_me', { link }),
        title: t('game_modes.chess_challenge'),
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={6}>
        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('game_modes.friend_challenge')}</Text>
          <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('game_modes.play_with_friends')}</Text>
        </VStack>

        {/* Mode Selector */}
        <View style={styles.modeSelectorGrid}>
          <TouchableOpacity
            style={[
              styles.modeButton, 
              { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
              mode === 'local' && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary }
            ]}
            onPress={() => setMode('local')}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'local' ? colors.foreground.primary : colors.foreground.secondary }]}>
              📱 Local Play
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton, 
              { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
              mode === 'create' && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary }
            ]}
            onPress={() => setMode('create')}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'create' ? colors.foreground.primary : colors.foreground.secondary }]}>
              {t('game_modes.create_challenge')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
              mode === 'join' && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary }
            ]}
            onPress={() => setMode('join')}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'join' ? colors.foreground.primary : colors.foreground.secondary }]}>
              {t('game_modes.join_challenge')}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'local' ? (
          <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
            <VStack gap={4}>
              <Card variant="default" size="md">
                <VStack gap={2} style={{ padding: 16 }}>
                  <Text style={[styles.label, { color: colors.foreground.primary }]}>📱 Pass & Play</Text>
                  <Text style={[styles.hint, { color: colors.foreground.secondary }]}>
                    Play offline with a friend on the same device. After each move, pass the device to your opponent.
                  </Text>
                </VStack>
              </Card>

              {/* Time Control */}
              <VStack gap={2}>
                <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('game_modes.time_control')}</Text>
                <View style={styles.timeControlGrid}>
                  {['1+0', '3+0', '5+0', '10+0', '15+10', '30+0'].map((tc) => (
                    <TouchableOpacity
                      key={tc}
                      style={[
                        styles.timeControlChip,
                        { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
                        timeControl === tc && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary },
                      ]}
                      onPress={() => setTimeControl(tc)}
                    >
                      <Text
                        style={[
                          styles.timeControlChipText,
                          { color: timeControl === tc ? colors.foreground.primary : colors.foreground.secondary },
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
                <Text style={[styles.label, { color: colors.foreground.primary }]}>Player 1 plays as:</Text>
                <View style={styles.colorSelector}>
                  {(['white', 'black', 'random'] as const).map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
                        playerColor === color && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary },
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

              {/* Start Game Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent.primary }]}
                onPress={handleCreateLocalGame}
              >
                <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>
                  {t('game_modes.start_game')}
                </Text>
              </TouchableOpacity>
            </VStack>
          </Animated.View>
        ) : mode === 'create' ? (
          <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
            <VStack gap={4}>
              {/* Time Control */}
              <VStack gap={2}>
                <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('game_modes.time_control')}</Text>
                <View style={styles.timeControlGrid}>
                  {['1+0', '3+0', '5+0', '10+0', '15+10', '30+0'].map((tc) => (
                    <TouchableOpacity
                      key={tc}
                      style={[
                        styles.timeControlChip,
                        { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
                        timeControl === tc && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary },
                      ]}
                      onPress={() => setTimeControl(tc)}
                    >
                      <Text
                        style={[
                          styles.timeControlChipText,
                          { color: timeControl === tc ? colors.foreground.primary : colors.foreground.secondary },
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
                <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('game_modes.play_as')}</Text>
                <View style={styles.colorSelector}>
                  {(['white', 'black', 'random'] as const).map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: colors.background.secondary, borderColor: 'transparent' },
                        playerColor === color && { backgroundColor: colors.background.tertiary, borderColor: colors.accent.primary },
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

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent.primary, opacity: isCreatingGame ? 0.5 : 1 }]}
                onPress={handleCreateChallenge}
                disabled={isCreatingGame}
              >
                <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>
                  {isCreatingGame ? t('game_modes.creating') : t('game_modes.create_share_link')}
                </Text>
              </TouchableOpacity>

              {gameLink && (
                <Card variant="default" size="md">
                  <VStack gap={2} style={{ padding: 16 }}>
                    <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('game_modes.challenge_link_created')}</Text>
                    <Text style={[styles.linkText, { color: colors.accent.primary }]} numberOfLines={1}>
                      {gameLink}
                    </Text>
                    <Text style={[styles.hint, { color: colors.foreground.muted }]}>
                      {t('game_modes.share_link_hint')}
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
                  <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('game_modes.enter_challenge_code')}</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colors.background.secondary, 
                      color: colors.foreground.primary,
                      borderColor: colors.background.tertiary,
                    }]}
                    placeholder={t('game_modes.paste_code_placeholder')}
                    placeholderTextColor={colors.foreground.muted}
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={[styles.hint, { color: colors.foreground.muted }]}>
                    Your friend will share a code or link with you
                  </Text>
                </VStack>
              </Card>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent.primary, opacity: (!joinCode.trim() || isCreatingGame) ? 0.5 : 1 }]}
                onPress={handleJoinChallenge}
                disabled={!joinCode.trim() || isCreatingGame}
              >
                <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>
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
  modeSelectorGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  modeButton: {
    flex: 1,
    minWidth: '30%',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
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
    borderWidth: 2,
  },
  timeControlChipText: {
    fontSize: 14,
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
  input: {
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
