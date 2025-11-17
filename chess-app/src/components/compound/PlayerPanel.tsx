import React from 'react';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Surface } from '../primitives/Surface';
import { spacing } from '../../ui/tokens';

export type Color = 'w' | 'b';

export interface PlayerPanelProps {
  position: 'top' | 'bottom';
  color: Color;
  isSelf: boolean;
  remainingMs: number;
  accountId: string;
}

const formatClock = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const PlayerPanel = React.forwardRef<any, PlayerPanelProps>(
  ({ position, color, isSelf, remainingMs, accountId }, ref) => {
    return (
      <Surface
        ref={ref}
        padding="md"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor={isSelf ? 'surfaceElevated' : 'surface'}
        style={{ minHeight: 60 }}
      >
        <Box flex={1} gap="sm">
          <Text variant="label" color="secondary">
            {isSelf ? 'You' : 'Opponent'} ({color === 'w' ? 'White' : 'Black'})
          </Text>
          <Text variant="caption" color="muted">
            Account: {accountId}
          </Text>
        </Box>

        <Box
          padding="md"
          backgroundColor="appBackground"
          style={{
            borderRadius: 8,
            minWidth: 60,
          }}
        >
          <Text
            variant="heading"
            color="primary"
            style={{ textAlign: 'center' }}
          >
            {formatClock(remainingMs)}
          </Text>
        </Box>
      </Surface>
    );
  }
);

PlayerPanel.displayName = 'PlayerPanel';
