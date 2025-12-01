import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { usePuzzle } from '@/contexts/PuzzleContext';

export default function DailyPuzzleScreen() {
  const router = useRouter();
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
          '🎉 Correct!',
          `You solved the daily puzzle in ${attempts + 1} attempt(s)!`,
          [
            {
              text: 'View Stats',
              onPress: () => router.push('/puzzle/history'),
            },
            {
              text: 'Continue',
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <Text style={styles.loaderText}>Loading daily puzzle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VStack style={styles.content} gap={6}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⭐ Daily Puzzle</Text>
          <Text style={styles.date}>{dailyPuzzle.date}</Text>
        </Animated.View>

        {/* Puzzle Info */}
        <Animated.View entering={SlideInDown.delay(200).duration(500)}>
          <Card variant="gradient" size="md">
            <VStack gap={2} style={{ padding: 16 }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rating:</Text>
                <Text style={styles.infoValue}>{dailyPuzzle.rating}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Themes:</Text>
                <View style={styles.themesContainer}>
                  {dailyPuzzle.themes.map((theme) => (
                    <View key={theme} style={styles.themeTag}>
                      <Text style={styles.themeText}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Attempts:</Text>
                <Text style={styles.infoValue}>{attempts}</Text>
              </View>
            </VStack>
          </Card>
        </Animated.View>

        {/* Chess Board Placeholder */}
        <Animated.View entering={SlideInDown.delay(300).duration(500)}>
          <Card variant="default" size="lg">
            <View style={styles.boardPlaceholder}>
              <Text style={styles.boardText}>Chess Board</Text>
              <Text style={styles.fenText}>FEN: {dailyPuzzle.fen}</Text>
              <Text style={styles.instructionText}>
                {isCorrect === null
                  ? `${dailyPuzzle.ply % 2 === 0 ? 'Black' : 'White'} to move`
                  : isCorrect
                  ? '✓ Correct move!'
                  : '✗ Try again!'}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Move Options */}
        <Animated.View entering={SlideInDown.delay(400).duration(500)}>
          <VStack gap={2}>
            <Text style={styles.movesLabel}>Select the best move:</Text>
            <View style={styles.movesGrid}>
              {/* Generate some example moves (in real app, these would come from legal moves) */}
              {['Nf7+', 'Qxh7+', 'Rxd8', 'Be5'].map((move, idx) => (
                <TouchableOpacity
                  key={move}
                  style={[
                    styles.moveChip,
                    selectedMove === move && styles.moveChipSelected,
                    isCorrect === true && selectedMove === move && styles.moveChipCorrect,
                    isCorrect === false && selectedMove === move && styles.moveChipWrong,
                  ]}
                  onPress={() => handleMoveSelect(move)}
                  disabled={isCorrect !== null}
                >
                  <Text
                    style={[
                      styles.moveText,
                      selectedMove === move && styles.moveTextSelected,
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
            <TouchableOpacity style={styles.resetButton} onPress={resetPuzzle}>
              <Text style={styles.resetButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {isCorrect === true && (
          <Animated.View entering={FadeIn.duration(300)}>
            <VStack gap={2}>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => router.push('/puzzle/history')}
              >
                <Text style={styles.successButtonText}>📊 View Stats</Text>
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
    backgroundColor: '#0F172A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#94A3B8',
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
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  themesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  themeTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeText: {
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  boardPlaceholder: {
    height: 320,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  boardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 12,
  },
  fenText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  movesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moveChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  moveChipSelected: {
    borderColor: '#667EEA',
    backgroundColor: '#334155',
  },
  moveChipCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#065F46',
  },
  moveChipWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#7F1D1D',
  },
  moveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  moveTextSelected: {
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667EEA',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    color: '#94A3B8',
  },
});
