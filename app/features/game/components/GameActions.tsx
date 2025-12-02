import React from 'react';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';
import { Box } from '@/ui/primitives/Box';
import { Badge } from '@/ui/primitives/Badge';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { typographyTokens } from '@/ui/tokens/typography';

export type GameStatus = 'in_progress' | 'waiting_for_opponent' | 'ended' | 'preparing';

export interface GameActionsProps {
  status?: GameStatus;
  result?: '1-0' | '0-1' | '1/2-1/2' | null;
  endReason?: string | null;
  sideToMove?: 'w' | 'b';
  onResign?: () => void;
  onOfferDraw?: () => void;
}

/**
 * GameActions Component
 * Displays game control buttons and status based on game state
 */

export const GameActions = React.forwardRef<unknown, GameActionsProps>(
  ({ status = 'in_progress', result, endReason, sideToMove = 'w', onResign, onOfferDraw }) => {
    const { colors } = useThemeTokens();
    const isGameActive = status === 'in_progress';
    const isGameEnded = status === 'ended';

    const getResultDisplay = () => {
      if (result === '1-0') return { text: '1 - 0', winner: 'White Wins' };
      if (result === '0-1') return { text: '0 - 1', winner: 'Black Wins' };
      if (result === '1/2-1/2') return { text: '½ - ½', winner: 'Draw' };
      return { text: 'Game Over', winner: '' };
    };

    const getStatusBadge = () => {
      switch (status) {
        case 'in_progress':
          return <Badge variant="success" size="lg">Live</Badge>;
        case 'ended':
          return <Badge variant="neutral" size="lg">Finished</Badge>;
        case 'waiting_for_opponent':
          return <Badge variant="warning" size="lg">Waiting</Badge>;
        case 'preparing':
          return <Badge variant="info" size="lg">Preparing</Badge>;
        default:
          return null;
      }
    };

    const getStatusMessage = () => {
      switch (status) {
        case 'waiting_for_opponent':
          return 'Waiting for opponent to join...';
        case 'preparing':
          return 'Game is being prepared...';
        default:
          return '';
      }
    };

    const resultData = getResultDisplay();

    return (
      <Box
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacingTokens[2],
          gap: spacingTokens[3],
        }}
      >
        {/* Game Status */}
        {isGameActive && (
          <>
            <Box flexDirection="row" gap={spacingTokens[3]} justifyContent="center" alignItems="center">
              <Button
                variant="outline"
                size="sm"
                onPress={onOfferDraw || (() => console.log('Draw offered'))}
                accessibilityLabel="Offer draw"
                style={{ minWidth: 100 }}
              >
                🤝 Draw
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onPress={onResign}
                accessibilityLabel="Resign from game"
                style={{ minWidth: 100 }}
              >
                🏳️ Resign
              </Button>
            </Box>
          </>
        )}

        {isGameEnded && (
          <Box alignItems="center" gap={spacingTokens[3]}>
            {endReason && (
              <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginBottom: spacingTokens[2] }}>
                {endReason}
              </Text>
            )}
            {result && (
              <>
                <Text variant="title" color={colors.foreground.primary} weight="bold" style={{ fontSize: typographyTokens.fontSize['3xl'], textAlign: 'center' }}>
                  {resultData.text}
                </Text>
                {resultData.winner && (
                  <Badge 
                    variant={result === '1/2-1/2' ? 'neutral' : 'primary'} 
                    size="lg"
                  >
                    {resultData.winner}
                  </Badge>
                )}
              </>
            )}
            {!result && !endReason && (
              <Text variant="title" color={colors.foreground.primary} weight="bold" style={{ fontSize: typographyTokens.fontSize['2xl'] }}>
                Game Over
              </Text>
            )}
          </Box>
        )}

        {!isGameActive && !isGameEnded && (
          <Box alignItems="center" gap={spacingTokens[3]}>
            <Text variant="body" color={colors.foreground.muted} style={{ fontStyle: 'italic', textAlign: 'center', fontSize: typographyTokens.fontSize.base }}>
              {getStatusMessage()}
            </Text>
          </Box>
        )}
      </Box>
    );
  }
);

GameActions.displayName = 'GameActions';

