import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';

export interface Move {
  moveNumber: number;
  color: 'w' | 'b';
  san: string; // Standard Algebraic Notation
}

export interface MoveListProps {
  moves?: Move[];
}

/**
 * MoveList Component
 * Displays the move history of a chess game in Standard Algebraic Notation
 */
export const MoveList = React.forwardRef<ScrollView, MoveListProps>(
  ({ moves = [] }, ref) => {
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
      <View style={styles.container}>
        <Text style={styles.title}>Moves ({moves.length})</Text>

        <ScrollView
          ref={ref}
          style={styles.scrollView}
          nestedScrollEnabled={true}
        >
          {moveGroups.length === 0 ? (
            <Text style={styles.emptyText}>No moves yet</Text>
          ) : (
            moveGroups.map((group) => (
              <View
                key={group.number}
                style={[
                  styles.moveGroup,
                  lastMove?.moveNumber === group.number && styles.lastMoveGroup,
                ]}
              >
                <Text style={styles.moveNumber}>{group.number}.</Text>

                <Text style={styles.moveText}>
                  {group.white?.san || '—'}
                </Text>

                <Text style={styles.moveText}>
                  {group.black?.san || '—'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }
);

MoveList.displayName = 'MoveList';

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  moveGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  lastMoveGroup: {
    backgroundColor: '#d4edda',
  },
  moveNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 32,
  },
  moveText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
