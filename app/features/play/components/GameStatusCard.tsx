/**
 * GameStatusCard Component
 * app/components/play/GameStatusCard.tsx
 * 
 * Displays current game status, result, and reason
 */

import React from 'react';
import { VStack, Card, Text, useColors } from '@/ui';

export type GameStatus = 'in_progress' | 'waiting_for_opponent' | 'ended' | 'preparing';

export interface GameStatusCardProps {
  status: GameStatus;
  endReason?: string;
  result?: '1-0' | '0-1' | '1/2-1/2' | null;
  sideToMove?: 'w' | 'b';
}

export const GameStatusCard: React.FC<GameStatusCardProps> = ({
  status,
  endReason,
  result,
  sideToMove,
}) => {
  const colors = useColors();

  const getStatusDisplay = () => {
    switch (status) {
      case 'ended':
        if (endReason) return endReason;
        if (result === '1-0') return '1-0 White Wins';
        if (result === '0-1') return '0-1 Black Wins';
        if (result === '1/2-1/2') return '½-½ Draw';
        return 'Game Over';
      case 'in_progress':
        return sideToMove === 'w' ? "White to move" : "Black to move";
      case 'waiting_for_opponent':
        return 'Waiting for opponent...';
      case 'preparing':
        return 'Game preparing...';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ended':
        return colors.feedback.error;
      case 'in_progress':
        return colors.feedback.success;
      default:
        return colors.foreground.secondary;
    }
  };

  return (
    <Card
      padding={4}
      shadow="card"
      style={{ backgroundColor: colors.background.secondary }}
    >
      <VStack gap={2}>
        <Text 
          variant="subheading" 
          color={colors.foreground.primary}
          style={{ fontWeight: '600' }}
        >
          Game Status
        </Text>
        <Text 
          variant="body" 
          color={getStatusColor()}
          style={{ fontWeight: '500' }}
        >
          {getStatusDisplay()}
        </Text>
      </VStack>
    </Card>
  );
};

GameStatusCard.displayName = 'GameStatusCard';
