/**
 * PlayerCard Component
 * app/components/play/PlayerCard.tsx
 * 
 * Enhanced player panel with card styling
 */

import React, { useState, useEffect } from 'react';
import { HStack, VStack, Card, Text, Avatar, useColors } from '@/ui';
import { safeStyles } from '@/ui/utilities/safeStyles';

export type Color = 'w' | 'b';

export interface PlayerCardProps {
  position: 'top' | 'bottom';
  color: Color;
  isSelf: boolean;
  remainingMs: number;
  accountId: string;
  isActive?: boolean;
  username?: string;
  rating?: number;
}

/**
 * Formats milliseconds into a chess clock display string
 */
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

export const PlayerCard: React.FC<PlayerCardProps> = ({
  color,
  isSelf,
  remainingMs,
  accountId,
  isActive,
  username,
  rating,
}) => {
  const colors = useColors();
  const [displayTime, setDisplayTime] = useState(remainingMs);

  useEffect(() => {
    setDisplayTime(remainingMs);
  }, [remainingMs]);

  useEffect(() => {
    if (!isActive || displayTime <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, displayTime]);

  const isLowTime = displayTime < 60000; // Less than 1 minute
  const displayName = username || (isSelf ? 'You' : 'Opponent');
  const displayRating = rating ? `(${rating})` : '';

  return (
    <Card
      padding={3}
      shadow="card"
      style={safeStyles(
        {
          backgroundColor: colors.background.secondary,
          borderWidth: 2,
          borderColor: isActive ? colors.feedback.info : 'transparent',
        }
      )}
    >
      <HStack gap={3} alignItems="center" justifyContent="space-between" fullWidth>
        <HStack gap={3} alignItems="center" flex={1}>
          <Avatar
            size={40}
            name={displayName}
            backgroundColor={color === 'w' ? '#E0E0E0' : '#424242'}
          />
          <VStack gap={1} flex={1}>
            <Text
              variant="body"
              color={colors.foreground.primary}
              style={{ fontWeight: '600' }}
            >
              {displayName} {displayRating}
            </Text>
            <Text
              variant="caption"
              color={colors.foreground.tertiary}
            >
              {color === 'w' ? 'White' : 'Black'}
            </Text>
          </VStack>
        </HStack>

        <VStack gap={1} alignItems="flex-end">
          <Text
            variant="subheading"
            color={isLowTime ? colors.feedback.error : colors.foreground.primary}
            style={safeStyles(
              { fontWeight: '700', fontVariant: ['tabular-nums'] as any }
            )}
          >
            {formatClock(displayTime)}
          </Text>
          {isActive && (
            <Text
              variant="caption"
              color={colors.feedback.success}
              style={{ fontWeight: '600' }}
            >
              Active
            </Text>
          )}
        </VStack>
      </HStack>
    </Card>
  );
};

PlayerCard.displayName = 'PlayerCard';
