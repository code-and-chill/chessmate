/**
 * MoveListCard Component
 * app/components/play/MoveListCard.tsx
 * 
 * Scrollable move list with card styling
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { VStack, Card, Text, HStack, useColors } from '@/ui';
import { safeStyles } from '@/ui/utilities/safeStyles';

export interface Move {
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
}

export interface MoveListCardProps {
  moves: Move[];
  maxHeight?: number;
}

export const MoveListCard: React.FC<MoveListCardProps> = ({
  moves = [],
  maxHeight = 320,
}) => {
  const colors = useColors();

  // Group moves by move number
  const moveGroups: Array<{ number: number; white?: Move; black?: Move }> = [];

  for (const move of moves) {
    const moveNumber = move.moveNumber;
    let group = moveGroups.find((g) => g.number === moveNumber);

    if (!group) {
      group = { number: moveNumber };
      moveGroups.push(group);
    }

    if (move.color === 'w') {
      group.white = move;
    } else {
      group.black = move;
    }
  }

  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;

  return (
    <Card
      padding={4}
      shadow="card"
      style={safeStyles(
        { backgroundColor: colors.background.secondary },
        { maxHeight }
      )}
    >
      <VStack gap={3} fullWidth>
        <HStack justifyContent="space-between" alignItems="center">
          <Text 
            variant="subheading" 
            color={colors.foreground.primary}
            style={{ fontWeight: '600' }}
          >
            Moves
          </Text>
          <Text 
            variant="caption" 
            color={colors.foreground.tertiary}
          >
            {moves.length}
          </Text>
        </HStack>

        <ScrollView
          style={{ maxHeight: maxHeight - 60 }}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <VStack gap={1}>
            {moveGroups.length === 0 ? (
              <Text 
                variant="body" 
                color={colors.foreground.tertiary}
                style={{ textAlign: 'center', paddingVertical: 20 }}
              >
                No moves yet
              </Text>
            ) : (
              moveGroups.map((group) => {
                const isLastMove = lastMove?.moveNumber === group.number;
                
                return (
                  <HStack
                    key={group.number}
                    gap={3}
                    padding={2}
                    style={safeStyles(
                      {
                        borderRadius: 6,
                        backgroundColor: isLastMove 
                          ? colors.background.tertiary 
                          : 'transparent',
                      }
                    )}
                  >
                    <Text
                      variant="body"
                      color={colors.foreground.tertiary}
                      style={{ width: 32, fontWeight: '600' }}
                    >
                      {group.number}.
                    </Text>

                    <Text
                      variant="body"
                      color={colors.foreground.primary}
                      style={{ flex: 1, fontWeight: '500' }}
                    >
                      {group.white?.san || '—'}
                    </Text>

                    <Text
                      variant="body"
                      color={colors.foreground.primary}
                      style={{ flex: 1, fontWeight: '500' }}
                    >
                      {group.black?.san || '—'}
                    </Text>
                  </HStack>
                );
              })
            )}
          </VStack>
        </ScrollView>
      </VStack>
    </Card>
  );
};

MoveListCard.displayName = 'MoveListCard';
