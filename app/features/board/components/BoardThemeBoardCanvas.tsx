import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card, useColors } from '@/ui';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { spacingTokens } from '@/ui/tokens/spacing';

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

  // Responsive size: use available width but cap to a reasonable max
  const size = Math.min(520, Math.floor(Math.min(width - 48, 520)));

  return (
    <Card padding={spacingTokens[6]} style={( [styles.hero, { backgroundColor: colors.background.secondary }] as any)}>
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
  );
};

const styles = StyleSheet.create({
  hero: { minWidth: 280, flex: 1, alignItems: 'center' },
  boardWrap: { justifyContent: 'center', alignItems: 'center', width: '100%' },
});

export default BoardThemeBoardCanvas;
