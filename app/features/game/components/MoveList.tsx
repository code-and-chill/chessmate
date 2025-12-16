import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { Box } from '@/ui/primitives/Box';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import type { Move } from '@/types/game';

import { typographyTokens } from '@/ui/tokens/typography';

export interface MoveListProps {
  moves?: Move[];
  onMoveSelect?: (moveIndex: number) => void;
}

/**
 * Get piece emoji for move notation
 */
const getPieceEmoji = (piece?: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'): string => {
  if (!piece || piece === 'P') return ''; // Pawns don't have prefix
  const pieces = {
    K: '♔',
    Q: '♕',
    R: '♖',
    B: '♗',
    N: '♘',
  };
  return pieces[piece];
};

/**
 * Parse SAN notation to extract piece type and indicators
 */
const parseSANNotation = (san: string, move: Move): {
  piece?: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
  displayText: string;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
} => {
  // Handle castling
  if (san === 'O-O' || san === 'O-O-O') {
    return {
      piece: 'K',
      displayText: san,
      isCapture: false,
      isCheck: san.includes('+'),
      isCheckmate: san.includes('#'),
    };
  }
  
  // Detect piece from first character
  const pieceMap: Record<string, 'K' | 'Q' | 'R' | 'B' | 'N'> = {
    K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N',
  };
  const firstChar = san[0];
  const piece = pieceMap[firstChar] || move.piece || 'P';
  
  // Remove check/checkmate indicators for display
  let displayText = san.replace(/[+#]$/, '');
  
  return {
    piece,
    displayText,
    isCapture: move.isCapture ?? san.includes('x'),
    isCheck: move.isCheck ?? san.includes('+'),
    isCheckmate: move.isCheckmate ?? san.includes('#'),
  };
};

/**
 * MoveList Component - Table Format
 * Displays moves as: 1  d2d4  c7c5
 */
export const MoveList = React.memo(
  React.forwardRef<ScrollView, MoveListProps>(
  ({ moves = [], onMoveSelect }, ref) => {
    const { colors, typography } = useThemeTokens();
    const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
    
    // Group moves by move number
    const moveGroups: Array<{ 
      number: number; 
      white?: Move; 
      black?: Move; 
      whiteIndex?: number; 
      blackIndex?: number;
    }> = [];

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const moveNumber = move.moveNumber;
      let group = moveGroups.find((g) => g.number === moveNumber);
      if (!group) {
        group = { number: moveNumber };
        moveGroups.push(group);
      }
      if (move.color === 'w') {
        group.white = move;
        group.whiteIndex = i;
      } else {
        group.black = move;
        group.blackIndex = i;
      }
    }

    const handleMovePress = (moveIndex: number) => {
      setSelectedMoveIndex(moveIndex);
      onMoveSelect?.(moveIndex);
    };

    return (
      <Box style={{ flex: 1 }}>
        {/* Table Header */}
        <Box
          style={{
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.background.secondary,
            borderBottomWidth: 1,
            borderBottomColor: colors.background.tertiary,
          }}
        >
          <Text variant="caption" weight="bold" color={colors.foreground.muted} style={{ fontSize: 12, width: 40 }}>
            #
          </Text>
          <Text variant="caption" weight="bold" color={colors.foreground.muted} style={{ fontSize: 12, flex: 1 }}>
            White
          </Text>
          <Text variant="caption" weight="bold" color={colors.foreground.muted} style={{ fontSize: 12, flex: 1 }}>
            Black
          </Text>
        </Box>

        {/* Table Body */}
        <ScrollView
          ref={ref}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 0 }}
          nestedScrollEnabled={true}
        >
          {moveGroups.length === 0 ? (
            <Box padding={24} alignItems="center">
              <Text style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>
                ♔
              </Text>
              <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14, fontStyle: 'italic', textAlign: 'center' }}>
                No moves yet
              </Text>
              <Text variant="caption" color={colors.foreground.muted} style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Moves will appear here as the game progresses
              </Text>
            </Box>
          ) : (
            moveGroups.map((group) => {
              const isWhiteSelected = selectedMoveIndex === group.whiteIndex;
              const isBlackSelected = selectedMoveIndex === group.blackIndex;
              
              return (
                <Box
                  key={group.number}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.background.tertiary,
                  }}
                >
                  {/* Move Number */}
                  <Box
                    style={{
                      width: 40,
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                      backgroundColor: colors.background.secondary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text variant="body" weight="bold" style={{ fontSize: 14, opacity: 0.6 }}>
                      {group.number}
                    </Text>
                  </Box>

                  {/* White Move */}
                  <Pressable
                    onPress={() => group.whiteIndex !== undefined && handleMovePress(group.whiteIndex)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: isWhiteSelected
                        ? colors.accent.primary
                        : pressed
                          ? colors.background.tertiary
                          : group.number % 2 === 0
                            ? colors.background.primary
                            : colors.background.secondary,
                    })}
                  >
                    {group.white ? (() => {
                      const parsed = parseSANNotation(group.white.san, group.white);
                      const pieceIcon = getPieceEmoji(parsed.piece);
                      
                      return (
                        <Box flexDirection="row" alignItems="center" gap={4}>
                          {/* Piece Icon */}
                          {pieceIcon && (
                            <Text style={{ fontSize: 16, opacity: 0.7, textAlignVertical: 'center', includeFontPadding: false }}>
                              {pieceIcon}
                            </Text>
                          )}
                          
                          {/* Move Text */}
                          <Text 
                            variant="body" 
                            color={isWhiteSelected ? colors.accentForeground.primary : colors.foreground.primary} 
                            weight="medium"
                            style={{ 
                              fontFamily: typographyTokens.fontFamily.mono, 
                              fontSize: 14,
                              fontVariant: ['tabular-nums'],
                            }}
                          >
                            {parsed.displayText}
                            {parsed.isCapture && <Text style={{ opacity: 0.6, textAlignVertical: 'center', includeFontPadding: false }}> ×</Text>}
                            {parsed.isCheckmate && <Text style={{ color: colors.error, fontWeight: 'bold', textAlignVertical: 'center', includeFontPadding: false }}> #</Text>}
                            {parsed.isCheck && !parsed.isCheckmate && <Text style={{ opacity: 0.8, textAlignVertical: 'center', includeFontPadding: false }}> +</Text>}
                          </Text>
                          
                          {/* Annotation */}
                          {group.white.annotation && (
                            <Text style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>
                              {group.white.annotation}
                            </Text>
                          )}
                        </Box>
                      );
                    })() : (
                      <Text variant="body" style={{ fontSize: 14, opacity: 0.3 }}>...</Text>
                    )}
                  </Pressable>

                  {/* Black Move */}
                  <Pressable
                    onPress={() => group.blackIndex !== undefined && handleMovePress(group.blackIndex)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: isBlackSelected
                        ? colors.accent.primary
                        : pressed
                          ? colors.background.tertiary
                          : group.number % 2 === 0
                            ? colors.background.primary
                            : colors.background.secondary,
                    })}
                  >
                    {group.black ? (() => {
                      const parsed = parseSANNotation(group.black.san, group.black);
                      const pieceIcon = getPieceEmoji(parsed.piece);
                      
                      return (
                        <Box flexDirection="row" alignItems="center" gap={4}>
                          {/* Piece Icon */}
                          {pieceIcon && (
                            <Text style={{ fontSize: 16, opacity: 0.7, textAlignVertical: 'center', includeFontPadding: false }}>
                              {pieceIcon}
                            </Text>
                          )}
                          
                          {/* Move Text */}
                          <Text 
                            variant="body" 
                            color={isBlackSelected ? colors.accentForeground.primary : colors.foreground.primary} 
                            weight="medium"
                            style={{ 
                              fontFamily: typographyTokens.fontFamily.mono, 
                              fontSize: 14,
                              fontVariant: ['tabular-nums'],
                            }}
                          >
                            {parsed.displayText}
                            {parsed.isCapture && <Text style={{ opacity: 0.6, textAlignVertical: 'center', includeFontPadding: false }}> ×</Text>}
                            {parsed.isCheckmate && <Text style={{ color: colors.error, fontWeight: 'bold', textAlignVertical: 'center', includeFontPadding: false }}> #</Text>}
                            {parsed.isCheck && !parsed.isCheckmate && <Text style={{ opacity: 0.8, textAlignVertical: 'center', includeFontPadding: false }}> +</Text>}
                          </Text>
                          
                          {/* Annotation */}
                          {group.black.annotation && (
                            <Text style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>
                              {group.black.annotation}
                            </Text>
                          )}
                        </Box>
                      );
                    })() : (
                      <Text variant="body" style={{ fontSize: 14, opacity: 0 }}>...</Text>
                    )}
                  </Pressable>
                </Box>
              );
            })
          )}
        </ScrollView>
      </Box>
    );
  })
);

MoveList.displayName = 'MoveList';
