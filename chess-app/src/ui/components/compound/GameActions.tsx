import React from 'react';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Surface } from '../primitives/Surface';
import { GameStatus } from '../../../core/models/game';
import { spacing, colors } from '../../tokens';

export interface GameActionsProps {
  status: GameStatus;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  endReason: string | null;
  onResign: () => void;
}

export const GameActions = React.forwardRef<any, GameActionsProps>(
  ({ status, result, endReason, onResign }, ref) => {
    const isGameActive = status === 'in_progress';
    const isGameEnded = status === 'ended';

    return (
      <Surface
        ref={ref}
        padding="md"
        flexDirection="row"
        gap="md"
        justifyContent="center"
        alignItems="center"
      >
        {isGameActive && (
          <Button
            variant="danger"
            size="md"
            onPress={onResign}
          >
            Resign
          </Button>
        )}

        {isGameEnded && result && (
          <Box
            alignItems="center"
            justifyContent="center"
            padding="md"
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: 8,
              minWidth: 150,
            }}
          >
            <Text variant="heading" color="primary">
              {result === '1-0' || result === '0-1' ? 'Game Over' : 'Draw'}
            </Text>
            {endReason && (
              <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
                {endReason}
              </Text>
            )}
          </Box>
        )}

        {!isGameActive && !isGameEnded && (
          <Text variant="caption" color="muted">
            {status === 'waiting_for_opponent'
              ? 'Waiting for opponent...'
              : 'Game preparing...'}
          </Text>
        )}
      </Surface>
    );
  }
);

GameActions.displayName = 'GameActions';
