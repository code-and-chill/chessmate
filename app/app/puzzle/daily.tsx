import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { usePuzzle } from '@/contexts/PuzzleContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export default function DailyPuzzleScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { dailyPuzzle, getDailyPuzzle, submitAttempt, isLoading } = usePuzzle();
  
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    getDailyPuzzle();
  }, []);

  const handleMoveSelect = async (move: string) => {
    if (isCorrect !== null) return; // Already solved
    
    setSelectedMove(move);
    setAttempts(prev => prev + 1);

    if (!dailyPuzzle) return;

    // Check if the move is correct (first move in solution)
    const correct = move === dailyPuzzle.solution[0];
    setIsCorrect(correct);

    // Submit attempt to backend
    await submitAttempt(dailyPuzzle.id, move, correct);

    if (correct) {
      setTimeout(() => {
        Alert.alert(
          t('puzzle.correct_title'),
          ti('puzzle.solved_attempts', { attempts: attempts + 1 }),
          [
            {
              text: t('puzzle.view_stats'),
              onPress: () => router.push('/puzzle/history'),
            },
            {
              text: t('common.continue'),
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]
        );
      }, 1000);
    }
  };

  const resetPuzzle = () => {
    setSelectedMove(null);
    setIsCorrect(null);
    setAttempts(0);
  };

  if (isLoading || !dailyPuzzle) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loader}>
          <Text style={[styles.loaderText, { color: colors.foreground.secondary }]}>{t('puzzle.loading_daily_puzzle')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={6}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>⭐ {t('puzzle.daily_puzzle')}</Text>
          <Text style={[styles.date, { color: colors.foreground.secondary }]}>{dailyPuzzle.date}</Text>
        </Animated.View>

        {/* Puzzle Info */}
        <Animated.View entering={SlideInDown.delay(200).duration(500)}>
          <Card variant="gradient" size="md">
            <VStack gap={2} style={{ padding: 16 }}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>{t('puzzle.rating')}:</Text>
                <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>{dailyPuzzle.rating}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>{t('puzzle.themes')}:</Text>
                <View style={styles.themesContainer}>
                  {dailyPuzzle.themes.map((theme) => (
                    <View key={theme} style={[styles.themeTag, { backgroundColor: colors.background.secondary }]}>
                      <Text style={[styles.themeText, { color: colors.foreground.primary }]}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>{t('puzzle.attempts')}:</Text>
                <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>{attempts}</Text>
              </View>
            </VStack>
          </Card>
        </Animated.View>

        {/* Chess Board Placeholder */}
        <Animated.View entering={SlideInDown.delay(300).duration(500)}>
          <Card variant="default" size="lg">
            <View style={styles.boardPlaceholder}>
              <Text style={[styles.boardText, { color: colors.foreground.primary }]}>{t('puzzle.chess_board')}</Text>
              <Text style={[styles.fenText, { color: colors.foreground.muted }]}>FEN: {dailyPuzzle.fen}</Text>
              <Text style={[styles.instructionText, { color: isCorrect === null ? colors.foreground.secondary : isCorrect ? colors.success : colors.error }]}>
                {isCorrect === null
                  ? ti('puzzle.to_move', { color: dailyPuzzle.ply % 2 === 0 ? t('game.black') : t('game.white') })
                  : isCorrect
                  ? t('puzzle.correct_move')
                  : t('puzzle.try_again')}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Move Options */}
        <Animated.View entering={SlideInDown.delay(400).duration(500)}>
          <VStack gap={2}>
            <Text style={[styles.movesLabel, { color: colors.foreground.primary }]}>{t('puzzle.select_best_move')}</Text>
            <View style={styles.movesGrid}>
              {/* Generate some example moves (in real app, these would come from legal moves) */}
              {['Nf7+', 'Qxh7+', 'Rxd8', 'Be5'].map((move, idx) => (
                <TouchableOpacity
                  key={move}
                  style={[
                    styles.moveChip,
                    { 
                      backgroundColor: selectedMove === move 
                        ? (isCorrect === true ? colors.success : isCorrect === false ? colors.error : colors.accent.primary)
                        : colors.background.secondary,
                      borderColor: selectedMove === move 
                        ? (isCorrect === true ? colors.success : isCorrect === false ? colors.error : colors.accent.primary)
                        : colors.background.tertiary
                    },
                  ]}
                  onPress={() => handleMoveSelect(move)}
                  disabled={isCorrect !== null}
                >
                  <Text
                    style={[
                      styles.moveText,
                      { color: selectedMove === move ? colors.accentForeground.primary : colors.foreground.secondary },
                    ]}
                  >
                    {move}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </Animated.View>

        {/* Action Buttons */}
        {isCorrect === false && (
          <Animated.View entering={FadeIn.duration(300)}>
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.accent.primary }]} onPress={resetPuzzle}>
              <Text style={[styles.resetButtonText, { color: colors.accentForeground.primary }]}>🔄 Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {isCorrect === true && (
          <Animated.View entering={FadeIn.duration(300)}>
            <VStack gap={2}>
              <TouchableOpacity
                style={[styles.successButton, { backgroundColor: colors.success }]}
                onPress={() => router.push('/puzzle/history')}
              >
                <Text style={[styles.successButtonText, { color: colors.accentForeground.primary }]}>📊 View Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => router.back()}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  themeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  boardPlaceholder: {
    height: 320,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  boardText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  fenText: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  movesLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moveChip: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  moveChipSelected: {
    // Handled inline
  },
  moveChipCorrect: {
    // Handled inline
  },
  moveChipWrong: {
    // Handled inline
  },
  moveText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moveTextSelected: {
    // Handled inline
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
  },
});
