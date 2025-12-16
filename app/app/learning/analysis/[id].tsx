/**
 * Game Analysis Detail Screen
 * 
 * Comprehensive post-game analysis with:
 * - AccuracyGraph (player vs opponent performance)
 * - EvalGraph (position evaluation timeline)
 * - MoveQualityBadge list (move classification)
 * - CoachAvatar with personalized feedback
 * - Critical moment identification
 */

import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccuracyGraph,
  EvalGraph,
  MoveQualityBadge,
  MoveQualityList,
  CoachAvatar,
  Card,
  VStack,
  HStack,
  useColors,
  useCriticalMomentDetection,
  useExpressionForSentiment,
  type MoveQuality,
  Icon,
} from '@/ui';

type GameResult = 'win' | 'loss' | 'draw';

interface Move {
  moveNumber: number;
  san: string;
  eval: number;
  accuracy: number;
  quality: MoveQuality;
  comment?: string;
}

interface GameData {
  id: string;
  opponent: string;
  result: GameResult;
  playerColor: 'white' | 'black';
  playerAccuracy: number;
  opponentAccuracy: number;
  moves: Move[];
  date: string;
  timeControl: string;
  opening: string;
}

export default function GameAnalysisScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colors = useColors();
  
  // Mock game data - replace with actual API call
  const gameData: GameData = useMemo(() => ({
    id: id as string,
    opponent: 'Magnus2024',
    result: 'win',
    playerColor: 'white',
    playerAccuracy: 87,
    opponentAccuracy: 72,
    timeControl: '10+0 Rapid',
    opening: 'Sicilian Defense: Najdorf Variation',
    date: '2025-12-03T10:30:00Z',
    moves: [
      { moveNumber: 1, san: 'e4', eval: 20, accuracy: 95, quality: 'book', comment: 'Opening theory' },
      { moveNumber: 2, san: 'Nf3', eval: 25, accuracy: 95, quality: 'best', comment: 'Developing knights' },
      { moveNumber: 3, san: 'd4', eval: 30, accuracy: 94, quality: 'best' },
      { moveNumber: 4, san: 'Nc3', eval: 35, accuracy: 93, quality: 'good' },
      { moveNumber: 5, san: 'Be3', eval: 40, accuracy: 92, quality: 'good' },
      { moveNumber: 6, san: 'f3', eval: 45, accuracy: 91, quality: 'good' },
      { moveNumber: 7, san: 'Qd2', eval: 50, accuracy: 90, quality: 'good' },
      { moveNumber: 8, san: 'O-O-O', eval: 120, accuracy: 98, quality: 'brilliant', comment: 'Excellent attacking setup!' },
      { moveNumber: 9, san: 'g4', eval: 130, accuracy: 90, quality: 'great' },
      { moveNumber: 10, san: 'h4', eval: 140, accuracy: 88, quality: 'good' },
      { moveNumber: 11, san: 'Bh6', eval: 150, accuracy: 87, quality: 'good' },
      { moveNumber: 12, san: 'g5', eval: 160, accuracy: 86, quality: 'good' },
      { moveNumber: 13, san: 'Nxg5', eval: -50, accuracy: 65, quality: 'mistake', comment: 'Weakens king safety' },
      { moveNumber: 14, san: 'Qxg5', eval: -80, accuracy: 70, quality: 'inaccuracy' },
      { moveNumber: 15, san: 'Rg1', eval: 100, accuracy: 95, quality: 'best', comment: 'Recovery!' },
      { moveNumber: 16, san: 'Rxg7', eval: 200, accuracy: 98, quality: 'brilliant', comment: 'Crushing blow!' },
      { moveNumber: 17, san: 'Qh6+', eval: 300, accuracy: 98, quality: 'best' },
      { moveNumber: 18, san: 'Rg6', eval: 400, accuracy: 97, quality: 'best' },
      { moveNumber: 19, san: 'Qxh7+', eval: 500, accuracy: 98, quality: 'best' },
      { moveNumber: 20, san: 'Qg8#', eval: 500, accuracy: 100, quality: 'best', comment: 'Checkmate!' },
    ],
  }), [id]);

  // Extract accuracy data
  const playerAccuracyData = useMemo(() => 
    gameData.moves.map(m => m.accuracy),
    [gameData.moves]
  );
  
  const opponentAccuracyData = useMemo(() => 
    gameData.moves.map((_, i) => Math.max(50, 95 - i * 1.2 - Math.random() * 10)),
    [gameData.moves]
  );
  
  // Extract evaluation data
  const evaluationData = useMemo(() => 
    gameData.moves.map(m => m.eval),
    [gameData.moves]
  );
  
  // Detect critical moments
  const criticalMoments = useCriticalMomentDetection(evaluationData);
  
  // Get move quality counts
  const qualityCounts = useMemo(() => {
    const counts: { quality: MoveQuality; count: number }[] = [];
    const qualityMap: Record<string, number> = {};
    
    gameData.moves.forEach(move => {
      qualityMap[move.quality] = (qualityMap[move.quality] || 0) + 1;
    });
    
    (['brilliant', 'great', 'best', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss'] as MoveQuality[]).forEach(quality => {
      if (qualityMap[quality]) {
        counts.push({ quality, count: qualityMap[quality] });
      }
    });
    
    return counts;
  }, [gameData.moves]);
  
  // Game phases (estimated)
  const gamePhases = {
    opening: 8,
    middlegame: 15,
    endgame: 20,
  };
  
  // Overall sentiment for coach
  const getOverallSentiment = (): 'positive' | 'neutral' | 'cautionary' | 'critical' => {
    if (gameData.result === 'win' && gameData.playerAccuracy >= 85) return 'positive';
    if (gameData.result === 'win') return 'neutral';
    if (gameData.result === 'loss' && gameData.playerAccuracy < 70) return 'critical';
    if (gameData.result === 'loss') return 'cautionary';
    return 'neutral';
  };
  
  const sentiment = getOverallSentiment();
  const coachExpression = useExpressionForSentiment(sentiment);
  
  const getCoachMessage = (): string => {
    if (gameData.result === 'win' && gameData.playerAccuracy >= 90) {
      return 'Outstanding performance! You played with incredible precision. Keep up the excellent work!';
    }
    if (gameData.result === 'win') {
      return 'Great win! You capitalized on your opponent\'s mistakes. Watch out for those inaccuracies though.';
    }
    if (gameData.result === 'loss' && gameData.playerAccuracy < 70) {
      return 'Tough game, but there\'s a lot to learn here. Focus on reducing blunders in critical positions.';
    }
    if (gameData.result === 'loss') {
      return 'You played well but couldn\'t convert. Review the critical moments to understand where the advantage slipped.';
    }
    return 'A well-fought draw! Both sides had chances. Great defensive play in the endgame.';
  };
  
  const getResultStyle = (result: GameResult) => {
    switch (result) {
      case 'win':
        return { color: colors.success, icon: 'trophy' as const, text: 'Victory' };
      case 'loss':
        return { color: colors.error, icon: 'error' as const, text: 'Defeat' };
      case 'draw':
        return { color: colors.warning, icon: 'success' as const, text: 'Draw' };
    }
  };
  
  const resultStyle = getResultStyle(gameData.result);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.background.secondary }]}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          
          <VStack gap={1} style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground.primary }]}>
              Game Analysis
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.foreground.secondary }]}>
              vs {gameData.opponent}
            </Text>
          </VStack>
          
          <View style={[styles.resultBadge, { backgroundColor: resultStyle.color + '20' }]}>
            <HStack gap={2} alignItems="center">
              <Icon name={resultStyle.icon as any} size={20} color={resultStyle.color} />
              <Text style={[styles.resultText, { color: resultStyle.color }]}>
                {resultStyle.text}
              </Text>
            </HStack>
          </View>
        </View>

        <VStack gap={6} style={{ padding: 20 }}>
          {/* Coach Feedback Card */}
          <Card variant="surfaceElevated" size="md" animated>
            <HStack gap={4} style={{ alignItems: 'flex-start' }}>
              <CoachAvatar
                expression={coachExpression}
                size="lg"
                animated
                bounce
              />
              <VStack gap={2} style={{ flex: 1 }}>
                <Text style={[styles.coachName, { color: colors.foreground.primary }]}>
                  Coach's Analysis
                </Text>
                <Text style={[styles.coachMessage, { color: colors.foreground.secondary }]}>
                  {getCoachMessage()}
                </Text>
              </VStack>
            </HStack>
          </Card>

          {/* Game Info */}
          <Card variant="elevated" size="md">
            <VStack gap={3}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                Game Details
              </Text>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>
                  Opening
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>
                  {gameData.opening}
                </Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>
                  Time Control
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>
                  {gameData.timeControl}
                </Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>
                  Your Color
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>
                  {gameData.playerColor === 'white' ? '⚪ White' : '⚫ Black'}
                </Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text style={[styles.infoLabel, { color: colors.foreground.secondary }]}>
                  Date
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>
                  {new Date(gameData.date).toLocaleDateString()}
                </Text>
              </HStack>
            </VStack>
          </Card>

          {/* Accuracy Graph */}
          <Card variant="elevated" size="md">
            <VStack gap={3}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                Accuracy Timeline
              </Text>
              <AccuracyGraph
                playerData={playerAccuracyData}
                opponentData={opponentAccuracyData}
                playerName="You"
                opponentName={gameData.opponent}
                showThresholds
                showAverages
                animated
              />
            </VStack>
          </Card>

          {/* Evaluation Graph */}
          <Card variant="elevated" size="md">
            <VStack gap={3}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                Position Evaluation
              </Text>
              <EvalGraph
                evaluations={evaluationData}
                playerColor={gameData.playerColor}
                criticalMoments={criticalMoments}
                phases={gamePhases}
                showZeroLine
                showPhases
                animated
              />
            </VStack>
          </Card>

          {/* Move Quality Breakdown */}
          <Card variant="elevated" size="md">
            <VStack gap={4}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                Move Quality Analysis
              </Text>
              <MoveQualityList
                qualities={qualityCounts}
                showLabels
                animated
              />
            </VStack>
          </Card>

          {/* Key Moments */}
          <Card variant="elevated" size="md">
            <VStack gap={4}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                Key Moments
              </Text>
              {gameData.moves
                .filter(m => m.quality === 'brilliant' || m.quality === 'blunder' || m.quality === 'mistake')
                .map((move) => (
                  <HStack key={move.moveNumber} gap={3} style={{ alignItems: 'flex-start' }}>
                    <MoveQualityBadge
                      quality={move.quality}
                      size="md"
                      showLabel={false}
                    />
                    <VStack gap={1} style={{ flex: 1 }}>
                      <HStack gap={2} style={{ alignItems: 'center' }}>
                        <Text style={[styles.moveNumber, { color: colors.foreground.secondary }]}>
                          {move.moveNumber}.
                        </Text>
                        <Text style={[styles.moveSan, { color: colors.foreground.primary }]}>
                          {move.san}
                        </Text>
                        <Text style={[styles.moveAccuracy, { color: colors.foreground.tertiary }]}>
                          ({move.accuracy}%)
                        </Text>
                      </HStack>
                      {move.comment && (
                        <Text style={[styles.moveComment, { color: colors.foreground.secondary }]}>
                          {move.comment}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                ))}
            </VStack>
          </Card>

          {/* Action Buttons */}
          <VStack gap={3}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.accent.primary }]}
              onPress={() => console.log('Review moves')}
            >
              <Text style={styles.buttonText}>🔍 Review Move by Move</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.accent.primary }]}
              onPress={() => console.log('Share analysis')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.accent.primary }]}>
                📤 Share Analysis
              </Text>
            </TouchableOpacity>
          </VStack>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
  },
  coachName: {
    fontSize: 16,
    fontWeight: '700',
  },
  coachMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  moveNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  moveSan: {
    fontSize: 16,
    fontWeight: '700',
  },
  moveAccuracy: {
    fontSize: 12,
  },
  moveComment: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  primaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
