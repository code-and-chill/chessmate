/**
 * GameInfo Component
 * app/features/game/components/GameInfo.tsx
 * 
 * Single-line status: "Game in Progress · White to move · 2 moves"
 */

import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

export interface GameInfoProps {
  status: 'in_progress' | 'ended';
  currentTurn: 'w' | 'b';
  moveCount: number;
  endReason?: string;
}

export const GameInfo: React.FC<GameInfoProps> = ({
  status,
  currentTurn,
  moveCount,
  endReason,
}) => {
  const { colors } = useThemeTokens();
  
  const statusText = status === 'in_progress' ? 'Game in Progress' : endReason || 'Game Ended';
  const turnText = currentTurn === 'w' ? 'White to move' : 'Black to move';
  const movesText = `${moveCount} ${moveCount === 1 ? 'move' : 'moves'}`;
  
  const displayText = status === 'in_progress' 
    ? `${statusText} · ${turnText} · ${movesText}`
    : `${statusText} · ${movesText}`;

  return (
    <Card variant="default" size="md" padding={16}>
      <Text 
        variant="body" 
        color={colors.foreground.secondary} 
        style={{ fontSize: 14, textAlign: 'center' }}
      >
        {displayText}
      </Text>
    </Card>
  );
};

GameInfo.displayName = 'GameInfo';
