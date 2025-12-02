/**
 * PlayerCard Component
 * app/features/game/components/PlayerCard.tsx
 * 
 * Enterprise-grade player display with avatar, color badge, name, rating, clock, and captured pieces
 */

import React, { useState, useEffect } from 'react';
import { ViewStyle } from 'react-native';
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
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
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
  onTimeExpire?: () => void;
  style?: ViewStyle;
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
  onTimeExpire,
  style,
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
    if (!isActive || displayTime <= 0) {
      if (displayTime === 0 && isActive && onTimeExpire) {
        onTimeExpire();
      }
      return;
    }
    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, displayTime, onTimeExpire]);

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
      <Box
        as="card"
        style={{
          borderRadius: spacingTokens[2],
          padding: 8,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? colors.accent.primary : colors.background.tertiary,
          backgroundColor: colors.background.secondary,
        }}
      >
        {/* Line 1: Avatar | Name | Rating */}
        <HStack gap={8} alignItems="center" style={{ marginBottom: 6 }}>
          <Box style={{ position: 'relative' }}>
            <Avatar
              name={name}
              size="sm"
              backgroundColor={color === 'w' ? colors.background.tertiary : colors.foreground.primary}
              textColor={color === 'w' ? colors.foreground.primary : colors.background.tertiary}
            />
            {/* Color Badge Overlay */}
            <Box
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: color === 'w' ? colors.background.tertiary : colors.foreground.primary,
                borderWidth: 2,
                borderColor: colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 8 }}>
                {color === 'w' ? '⚪' : '⚫'}
              </Text>
            </Box>
          </Box>

          <VStack flex={1} gap={2}>
            <HStack alignItems="center" gap={6}>
              <Text variant="subheading" weight="semibold" style={{ fontSize: 14 }}>
                {name}
              </Text>
              {isSelf && (
                <Badge variant="info" size="sm">You</Badge>
              )}
            </HStack>
            
            {rating && (
              <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 12 }}>
                {rating}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Line 2: Color badge | Clock */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack gap={8} alignItems="center">
            <Box
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: colors.background.tertiary,
              }}
            >
              <Text variant="caption" weight="semibold" style={{ fontSize: 12 }}>
                {colorName}
              </Text>
            </Box>
            
            {/* Captured Pieces */}
            {capturedPieces.length > 0 && (
              <HStack gap={4} alignItems="center">
                {capturedPieces.slice(0, 5).map((piece, idx) => (
                  <Text key={idx} style={{ fontSize: 12, opacity: 0.7 }}>
                    {PIECE_SYMBOLS[piece]}
                  </Text>
                ))}
                {materialValue > 0 && (
                  <Text 
                    variant="caption" 
                    weight="bold"
                    color={colors.foreground.secondary}
                    style={{ fontSize: 12, marginLeft: 4 }}
                  >
                    +{materialValue}
                  </Text>
                )}
              </HStack>
            )}
          </HStack>

          <Animated.View style={clockAnimatedStyle}>
            <Box
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: isLowTime 
                  ? (isDark ? '#7F1D1D' : '#FEE2E2') 
                  : colors.background.primary,
                borderWidth: 1,
                borderColor: isLowTime ? colors.error : colors.background.tertiary,
              }}
            >
              <Text 
                weight="bold"
                color={isLowTime ? colors.error : colors.foreground.primary}
                style={{ fontSize: 16, fontVariant: ['tabular-nums'] }}
              >
                {formatClock(displayTime)}
              </Text>
            </Box>
          </Animated.View>
        </HStack>

      </Box>
    </Animated.View>
  );
});

PlayerCard.displayName = 'PlayerCard';
