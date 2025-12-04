/**
 * PlayerCard Component
 * app/features/game/components/PlayerCard.tsx
 * 
 * Enterprise-grade player display with avatar, color badge, name, rating, clock, and captured pieces
 */

import React, { useState, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Box } from '@/ui/primitives/Box';
import { HStack, VStack } from '@/ui/primitives/Stack';
import { Avatar } from '@/ui/primitives/Avatar';
import { Badge } from '@/ui/primitives/Badge';
import { Text } from '@/ui/primitives/Text';
import { Panel } from '@/ui/primitives/Panel';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { typographyTokens } from '@/ui/tokens/typography';
import { formatClock } from '@/util/time';

export type Color = 'w' | 'b';

export interface PlayerCardProps {
  color: Color;
  name: string;
  rating?: number;
  isSelf: boolean;
  isActive?: boolean;
  remainingMs: number;
  capturedPieces?: string[];
  gameStatus?: 'in_progress' | 'ended' | 'draw' | 'resigned';
  onTimeExpire?: () => void;
  style?: ViewStyle;
  showRating?: boolean; // Hide ratings for casual/local games
}

const PIECE_SYMBOLS: Record<string, string> = {
  'p': '♟',
  'n': '♞',
  'b': '♝',
  'r': '♜',
  'q': '♛',
};

const PIECE_VALUES: Record<string, number> = {
  'p': 1,
  'n': 3,
  'b': 3,
  'r': 5,
  'q': 9,
};

export const PlayerCard = React.memo<PlayerCardProps>(({
  color,
  name,
  rating,
  isSelf,
  isActive = false,
  remainingMs,
  capturedPieces = [],
  gameStatus = 'in_progress',
  onTimeExpire,
  style,
  showRating = true, // Default to showing ratings
}) => {
  const [displayTime, setDisplayTime] = useState(remainingMs);
  const { colors, isDark } = useThemeTokens();
  
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  const colorName = color === 'w' ? 'White' : 'Black';
  const isLowTime = displayTime < 60000; // Less than 1 minute

  // Timer countdown
  useEffect(() => {
    setDisplayTime(remainingMs);
  }, [remainingMs]);

  useEffect(() => {
    // Stop clock if game is not in progress
    if (gameStatus !== 'in_progress' || !isActive || displayTime <= 0) {
      if (displayTime === 0 && isActive && onTimeExpire) {
        onTimeExpire();
      }
      return;
    }
    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, displayTime, gameStatus, onTimeExpire]);

  // Active turn glow animation
  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.6, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, glowOpacity]);

  // Low time pulse animation
  useEffect(() => {
    if (isLowTime && isActive) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isLowTime, isActive, pulseScale]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowOpacity.value, [0, 1], [0, 0.4]),
    shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 16]),
    shadowColor: colors.accent.primary,
  }));

  const clockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Calculate material advantage
  const materialValue = capturedPieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece] || 0), 0);

  return (
    <Animated.View style={[glowStyle, style]}>
      <Panel
        variant="glass"
        padding={spacingTokens[2]} // Compact 8px padding
        style={{
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? colors.accent.primary : 'rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Compact Single Row */}
        <HStack gap={spacingTokens[2]} alignItems="center" justifyContent="space-between">
          {/* Left: Avatar with badge */}
          <Box style={{ position: 'relative' }}>
            <Avatar
              name={name}
              size="sm"
              backgroundColor={color === 'w' ? colors.background.tertiary : colors.foreground.primary}
              textColor={color === 'w' ? colors.foreground.primary : colors.background.tertiary}
            />
            <Box
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: color === 'w' ? colors.background.tertiary : colors.foreground.primary,
                borderWidth: 2,
                borderColor: colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 7 }}>
                {color === 'w' ? '⭕' : '⚫'}
              </Text>
            </Box>
          </Box>

          {/* Middle: Name + Rating */}
          <HStack flex={1} alignItems="center" gap={spacingTokens[1]}>
            <Text variant="body" weight="semibold" style={{ fontSize: typographyTokens.fontSize.sm }}>
              {name}
            </Text>
            {showRating && rating && (
              <Text variant="caption" color={colors.foreground.muted} style={{ fontSize: 10 }}>
                ({rating})
              </Text>
            )}
          </HStack>

          {/* Right: Material + Clock */}
          <HStack gap={spacingTokens[1]} alignItems="center">
            {/* Material advantage - max 3 pieces */}
            {capturedPieces.length > 0 && (
              <HStack gap={2} alignItems="center">
                {capturedPieces.slice(0, 3).map((piece, idx) => (
                  <Text key={idx} style={{ fontSize: 11 }}>
                    {PIECE_SYMBOLS[piece]}
                  </Text>
                ))}
                {materialValue > 0 && (
                  <Text 
                    variant="caption" 
                    weight="semibold"
                    style={{ fontSize: 9, color: colors.accent.primary }}
                  >
                    +{materialValue}
                  </Text>
                )}
              </HStack>
            )}

            {/* Clock */}
            <Animated.View style={clockAnimatedStyle}>
              <Box
                style={{
                  paddingHorizontal: spacingTokens[2],
                  paddingVertical: spacingTokens[1],
                  borderRadius: 4,
                  backgroundColor: isLowTime && isActive
                    ? colors.error
                    : colors.background.secondary,
                  minWidth: 52,
                }}
              >
                <Text 
                  weight="bold"
                  color={isLowTime && isActive ? colors.background.primary : colors.foreground.primary}
                  style={{ 
                    fontSize: typographyTokens.fontSize.xs, 
                    fontVariant: ['tabular-nums'],
                    textAlign: 'center',
                  }}
                >
                  {formatClock(displayTime)}
                </Text>
              </Box>
            </Animated.View>
          </HStack>
        </HStack>

      </Panel>
    </Animated.View>
  );
});

PlayerCard.displayName = 'PlayerCard';
