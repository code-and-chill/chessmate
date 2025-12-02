import type React from 'react';
import { Modal, Pressable } from 'react-native';
import { Box } from '@/ui/primitives/Box';
import { Surface } from '@/ui/primitives/Surface';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens, useColors } from '@/ui/hooks/useThemeTokens';
import { typographyTokens } from '@/ui/tokens/typography';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';

export type PieceType = 'q' | 'r' | 'b' | 'n';

interface PawnPromotionModalProps {
  visible: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

const PIECE_SYMBOLS: Record<string, { white: string; black: string; name: string }> = {
  q: { white: '♕', black: '♛', name: 'Queen' },
  r: { white: '♖', black: '♜', name: 'Rook' },
  b: { white: '♗', black: '♝', name: 'Bishop' },
  n: { white: '♘', black: '♞', name: 'Knight' },
};

export const PawnPromotionModal: React.FC<PawnPromotionModalProps> = ({
  visible,
  color,
  onSelect,
  onCancel,
}) => {
  const { colors } = useThemeTokens();
  const themeColors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: themeColors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
        onPress={onCancel}
      >
        <Pressable onPress={e => e.stopPropagation()}>
          <Surface
            variant="default"
            style={{
              borderRadius: radiusTokens.lg,
              padding: spacingTokens[6],
              maxWidth: 400,
              width: '90%',
            }}
          >
            <Box gap={spacingTokens[4]}>
              {/* Header */}
              <Box alignItems="center" gap={spacingTokens[2]}>
                <Text variant="title" weight="bold" color={colors.foreground.primary} style={{ fontSize: typographyTokens.fontSize['2xl'] }}>
                  Promote Pawn
                </Text>
                <Text variant="body" color={colors.foreground.muted} style={{ fontSize: typographyTokens.fontSize.sm, textAlign: 'center' }}>
                  Choose a piece to promote your pawn
                </Text>
              </Box>

              {/* Piece Selection Grid */}
              <Box 
                flexDirection="row" 
                gap={spacingTokens[3]} 
                style={{ justifyContent: 'center', flexWrap: 'wrap' }}
              >
                {(['q', 'r', 'b', 'n'] as PieceType[]).map((piece) => {
                  const pieceData = PIECE_SYMBOLS[piece];
                  const symbol = color === 'w' ? pieceData.white : pieceData.black;

                  return (
                    <Pressable
                      key={piece}
                      onPress={() => onSelect(piece)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: pressed 
                            ? colors.accent.primary 
                            : colors.background.secondary,
                          borderRadius: radiusTokens.md,
                          padding: spacingTokens[4],
                          minWidth: 100,
                          alignItems: 'center',
                          gap: spacingTokens[2],
                          borderWidth: 2,
                          borderColor: colors.background.tertiary,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: typographyTokens.fontSize['4xl'] }}>
                        {symbol}
                      </Text>
                      <Text 
                        variant="body" 
                        weight="semibold"
                        color={colors.foreground.primary}
                        style={{ fontSize: typographyTokens.fontSize.sm }}
                      >
                        {pieceData.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </Box>
            </Box>
          </Surface>
        </Pressable>
      </Pressable>
    </Modal>
  );
};


