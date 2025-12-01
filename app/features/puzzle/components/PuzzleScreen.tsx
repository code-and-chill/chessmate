/**
 * Puzzle Feature - Screen Component
 * features/puzzle/components/PuzzleScreen.tsx
 */

import { useState } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Input } from '@/ui/primitives/Input';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { PuzzlePlayScreen } from '../screens/PuzzlePlayScreen';

export type PuzzleScreenProps = {
  initialPuzzleId?: string;
};

export const PuzzleScreen: React.FC<PuzzleScreenProps> = ({ initialPuzzleId = 'puzzle-123' }) => {
  const [puzzleId, setPuzzleId] = useState(initialPuzzleId);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  const handlePuzzleComplete = (data: Record<string, unknown>) => {
    console.log('Puzzle completed:', data);
    setShowPuzzle(false);
  };

  if (showPuzzle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <PuzzlePlayScreen 
          puzzleId={puzzleId} 
          onComplete={handlePuzzleComplete}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={getColor(colorTokens.blue[600], isDark)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6], justifyContent: 'center', flex: 1 }} gap={6}>
        <VStack gap={2}>
          <Text variant="heading" color={colors.foreground}>
            Daily Puzzle
          </Text>
          <Text variant="body" color={colors.secondary}>
            Solve chess puzzles and improve your skills
          </Text>
        </VStack>
        
        <Card variant="default" size="md">
          <VStack gap={4} style={{ padding: spacingTokens[4] }}>
            <Input
              placeholder="Enter puzzle ID (e.g., puzzle-123)"
              value={puzzleId}
              onChangeText={setPuzzleId}
            />
            
            <Button
              variant="solid"
              size="md"
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  setShowPuzzle(true);
                  setLoading(false);
                }, 500);
              }}
            >
              Start Puzzle
            </Button>

            <Button
              variant="outline"
              size="md"
              onPress={() => {
                setPuzzleId('puzzle-demo');
                setLoading(true);
                setTimeout(() => {
                  setShowPuzzle(true);
                  setLoading(false);
                }, 500);
              }}
            >
              Try Daily Puzzle
            </Button>
          </VStack>
        </Card>
      </VStack>
    </SafeAreaView>
  );
};
