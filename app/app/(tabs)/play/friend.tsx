import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView, TextInput, Share } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, RatedToggle } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useThemeTokens, useFonts } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

type ChallengeMode = 'create' | 'join' | 'local';

export default function FriendChallengeScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const fonts = useFonts();
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const { createFriendGame, joinFriendGame, isCreatingGame, createLocalGame } = useGame();
  
  const [mode, setMode] = useState<ChallengeMode>('local');
  const [gameLink, setGameLink] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [timeControl, setTimeControl] = useState<string>('10+0');
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('random');
  const [rated, setRated] = useState<boolean>(true);

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
        rated: rated,
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
        rated,
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={2} style={{ alignItems: 'center' }}>
              <Text style={[styles.title, { color: colors.accent.primary }]}>
                {t('game_modes.friend_challenge')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
                {t('game_modes.play_with_friends')}
              </Text>
            </VStack>
          </Animated.View>

          {/* Mode Selector */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Panel variant="glass" padding={16}>
              <HStack gap={2}>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    mode === 'local' && [styles.modeTabActive, { backgroundColor: colors.accent.primary }],
                  ]}
                  onPress={() => setMode('local')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      { color: mode === 'local' ? '#FFFFFF' : colors.foreground.secondary },
                    ]}
                  >
                    📱
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    mode === 'create' && [styles.modeTabActive, { backgroundColor: colors.accent.primary }],
                  ]}
                  onPress={() => setMode('create')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      { color: mode === 'create' ? '#FFFFFF' : colors.foreground.secondary },
                    ]}
                  >
                    ➕
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    mode === 'join' && [styles.modeTabActive, { backgroundColor: colors.accent.primary }],
                  ]}
                  onPress={() => setMode('join')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      { color: mode === 'join' ? '#FFFFFF' : colors.foreground.secondary },
                    ]}
                  >
                    🔗
                  </Text>
                </TouchableOpacity>
              </HStack>
            </Panel>
          </Animated.View>

        {mode === 'local' ? (
          <>
            {/* Info Panel */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={2}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    📱 Pass & Play
                  </Text>
                  <Text style={[styles.description, { color: colors.foreground.secondary }]}>
                    Play offline with a friend on the same device. After each move, pass the device to your opponent.
                  </Text>
                </VStack>
              </Panel>
            </Animated.View>

            {/* Time Control */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={3}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t('game_modes.time_control')}
                  </Text>
                  <View style={styles.timeControlGrid}>
                    {['1+0', '3+0', '5+0', '10+0', '15+10', '30+0'].map((tc) => (
                      <TouchableOpacity
                        key={tc}
                        style={[
                          styles.timeControlChip,
                          {
                            backgroundColor: timeControl === tc
                              ? 'rgba(102, 126, 234, 0.15)'
                              : colors.background.secondary,
                            borderColor: timeControl === tc ? colors.accent.primary : 'transparent',
                          },
                        ]}
                        onPress={() => setTimeControl(tc)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeControlChipText,
                            {
                              color: timeControl === tc
                                ? colors.accent.primary
                                : colors.foreground.secondary,
                            },
                          ]}
                        >
                          {tc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </VStack>
              </Panel>
            </Animated.View>

            {/* Color Selection */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={3}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    Player 1 plays as
                  </Text>
                  <HStack gap={3}>
                    {(['white', 'black', 'random'] as const).map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorButton,
                          {
                            backgroundColor: playerColor === color
                              ? 'rgba(102, 126, 234, 0.15)'
                              : colors.background.secondary,
                            borderColor: playerColor === color ? colors.accent.primary : 'transparent',
                          },
                        ]}
                        onPress={() => setPlayerColor(color)}
                        activeOpacity={0.7}
                      >
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
                          {color === 'white' && `⚪ ${t('game_modes.white')}`}
                          {color === 'black' && `⚫ ${t('game_modes.black')}`}
                          {color === 'random' && `🎲 ${t('game_modes.random')}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </HStack>
                </VStack>
              </Panel>
            </Animated.View>

            {/* Rated/Casual Toggle */}
            <Animated.View entering={FadeInDown.delay(450).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={3} style={{ alignItems: 'center' }}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    Game Type
                  </Text>
                  <RatedToggle
                    value={rated}
                    onChange={setRated}
                  />
                </VStack>
              </Panel>
            </Animated.View>

            {/* Create Button */}
            <Animated.View entering={FadeInUp.delay(500).duration(400)}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent.primary }]}
                onPress={handleCreateLocalGame}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{t('game_modes.start_game')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : mode === 'create' ? (
          <>
            {/* Time Control */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={3}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t('game_modes.time_control')}
                  </Text>
                  <View style={styles.timeControlGrid}>
                    {['1+0', '3+0', '5+0', '10+0', '15+10', '30+0'].map((tc) => (
                      <TouchableOpacity
                        key={tc}
                        style={[
                          styles.timeControlChip,
                          {
                            backgroundColor: timeControl === tc
                              ? 'rgba(102, 126, 234, 0.15)'
                              : colors.background.secondary,
                            borderColor: timeControl === tc ? colors.accent.primary : 'transparent',
                          },
                        ]}
                        onPress={() => setTimeControl(tc)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeControlChipText,
                            {
                              color: timeControl === tc
                                ? colors.accent.primary
                                : colors.foreground.secondary,
                            },
                          ]}
                        >
                          {tc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </VStack>
              </Panel>
            </Animated.View>

            {/* Color Selection */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
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
                              ? 'rgba(102, 126, 234, 0.15)'
                              : colors.background.secondary,
                            borderColor: playerColor === color ? colors.accent.primary : 'transparent',
                          },
                        ]}
                        onPress={() => setPlayerColor(color)}
                        activeOpacity={0.7}
                      >
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
                          {color === 'white' && `⚪ ${t('game_modes.white')}`}
                          {color === 'black' && `⚫ ${t('game_modes.black')}`}
                          {color === 'random' && `🎲 ${t('game_modes.random')}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </HStack>
                </VStack>
              </Panel>
            </Animated.View>

            {/* Create Button */}
            <Animated.View entering={FadeInUp.delay(500).duration(400)}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.accent.primary, opacity: isCreatingGame ? 0.6 : 1 },
                ]}
                onPress={handleCreateChallenge}
                disabled={isCreatingGame}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isCreatingGame ? t('game_modes.creating') : t('game_modes.create_share_link')}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {gameLink && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <Panel variant="glass" padding={20}>
                  <VStack gap={2}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                      {t('game_modes.challenge_link_created')}
                    </Text>
                    <Text
                      style={[styles.linkText, { fontFamily: fonts.mono, color: colors.accent.primary }]}
                      numberOfLines={1}
                    >
                      {gameLink}
                    </Text>
                    <Text style={[styles.description, { color: colors.foreground.muted }]}>
                      {t('game_modes.share_link_hint')}
                    </Text>
                  </VStack>
                </Panel>
              </Animated.View>
            )}
          </>
        ) : (
          <>
            {/* Join Code Input */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={3}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t('game_modes.enter_challenge_code')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background.secondary,
                        color: colors.foreground.primary,
                        borderColor: colors.background.tertiary,
                      },
                    ]}
                    placeholder={t('game_modes.paste_code_placeholder')}
                    placeholderTextColor={colors.foreground.muted}
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={[styles.description, { color: colors.foreground.muted }]}>
                    Your friend will share a code or link with you
                  </Text>
                </VStack>
              </Panel>
            </Animated.View>

            {/* Join Button */}
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.accent.primary,
                    opacity: !joinCode.trim() || isCreatingGame ? 0.6 : 1,
                  },
                ]}
                onPress={handleJoinChallenge}
                disabled={!joinCode.trim() || isCreatingGame}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isCreatingGame ? 'Joining...' : 'Join Game'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
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
  modeTab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTabText: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
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
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
