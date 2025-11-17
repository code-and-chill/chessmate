import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Surface } from '../primitives/Surface';
import { spacing } from '../../ui/tokens';

export interface Move {
  moveNumber: number;
  color: 'w' | 'b';
  san: string; // Standard Algebraic Notation
}

export interface MoveListProps {
  moves: Move[];
}

export const MoveList = React.forwardRef<any, MoveListProps>(
  ({ moves }, ref) => {
    const moveGroups: Array<{ number: number; white?: Move; black?: Move }> = [];
    
    for (const move of moves) {
      const moveNumber = move.moveNumber;
      let group = moveGroups.find(g => g.number === moveNumber);
      
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
      <Surface
        ref={ref}
        padding="md"
        style={{ maxHeight: 300, borderRadius: 12 }}
      >
        <Text variant="label" color="primary" style={{ marginBottom: spacing.md }}>
          Moves ({moves.length})
        </Text>
        
        <ScrollView>
          {moveGroups.map(group => (
            <Box
              key={group.number}
              flexDirection="row"
              gap="md"
              marginVertical="xs"
              backgroundColor={
                lastMove?.moveNumber === group.number
                  ? 'accentGreen'
                  : undefined
              }
              style={{
                paddingVertical: spacing.xs,
                borderRadius: 4,
              }}
            >
              <Text
                variant="caption"
                color="secondary"
                style={{ minWidth: 30, fontWeight: '600' }}
              >
                {group.number}.
              </Text>
              
              {group.white && (
                <Text variant="caption" color="primary">
                  {group.white.san}
                </Text>
              )}
              
              {group.black && (
                <Text variant="caption" color="primary">
                  {group.black.san}
                </Text>
              )}
            </Box>
          ))}
          
          {moves.length === 0 && (
            <Text variant="caption" color="muted">
              No moves yet
            </Text>
          )}
        </ScrollView>
      </Surface>
    );
  }
);

MoveList.displayName = 'MoveList';
