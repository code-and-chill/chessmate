import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card, useColors } from '@/ui';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { spacingTokens, spacingScale } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Draft = {
  boardColorId: string;
  pieceTheme: string;
  showCoordinates: boolean;
};

export const BoardThemeBoardCanvas: React.FC<{
  draft: Draft; // controlled prop
  availableBoardColors: any[];
}> = ({ draft, availableBoardColors }) => {
  const colorsFromHook = useColors();
  const colors = colorsFromHook ?? { background: { primary: '#FFFFFF', secondary: '#F7F7F7' }, text: { primary: '#111827' } };
  const { width } = useWindowDimensions();

  const activeColor = useMemo(() => availableBoardColors.find((b) => b.id === draft.boardColorId) ?? availableBoardColors[0], [availableBoardColors, draft.boardColorId]);

  // Responsive size: adapt to container width with better breakpoints
  const containerPadding = spacingTokens[4] * 2;
  const maxSize = 480;
  const minSize = 280;
  const availableWidth = width - containerPadding - spacingTokens[6] * 2; // Account for card padding
  const size = Math.max(minSize, Math.min(maxSize, Math.floor(availableWidth * 0.9)));

  return (
    <Animated.View 
      key={`${draft.boardColorId}-${draft.pieceTheme}`}
      entering={FadeIn.duration(300)} 
      exiting={FadeOut.duration(200)}
    >
      <Card 
        variant="glass" 
        size="lg" 
        style={[
          styles.previewCard, 
          { 
            backgroundColor: colors.background.card,
            ...shadowTokens.hover,
          }
        ]}
      >
        <View style={styles.boardWrap}>
          <ChessBoard
            fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            boardTheme={{ lightSquare: activeColor.light, darkSquare: activeColor.dark } as any}
            pieceTheme={draft.pieceTheme as any}
            showCoordinates={draft.showCoordinates}
            isInteractive={false}
            size={size}
          />
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  previewCard: { 
    minWidth: 280, 
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusTokens.lg,
    overflow: 'hidden',
  },
  boardWrap: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
    paddingVertical: spacingTokens[2],
  },
});

export default BoardThemeBoardCanvas;
