import React, { useState, useEffect } from 'react';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import { Box } from '@/ui/primitives/Box';
import { Surface } from '@/ui/primitives/Surface';
import { Text } from '@/ui/primitives/Text';
import { Badge } from '@/ui/primitives/Badge';
import { useThemeTokens, useFonts } from '@/ui/hooks/useThemeTokens';
import { radiusTokens } from '@/ui/tokens/radii';
import { spacingTokens } from '@/ui/tokens/spacing';
import { formatClock } from '@/util/time';

export type Color = 'w' | 'b';

export interface PlayerPanelProps {
  position: 'top' | 'bottom';
  color: Color;
  isSelf: boolean;
  remainingMs: number;
  accountId: string;
  isActive?: boolean; // Whether this player's timer is running
  capturedPieces?: string[]; // Array of captured piece types: 'p', 'n', 'b', 'r', 'q'
  onTimeExpire?: () => void; // Callback when time runs out
}

/**
 * PlayerPanel Component
 * Displays player information including color, identity, and remaining time
 */
// Unicode chess piece symbols
const PIECE_SYMBOLS: Record<string, string> = {
  'p': '♟', // pawn
  'n': '♞', // knight
  'b': '♝', // bishop
  'r': '♜', // rook
  'q': '♛', // queen
};

export const PlayerPanel = React.forwardRef<unknown, PlayerPanelProps>(
  ({ color, isSelf, remainingMs, accountId, isActive, capturedPieces = [], onTimeExpire }) => {
    const [displayTime, setDisplayTime] = useState(remainingMs);
    const { colors } = useThemeTokens();
    const pulseScale = useSharedValue(1);

    useEffect(() => {
      setDisplayTime(remainingMs);
    }, [remainingMs]);

    const colorName = color === 'w' ? 'White' : 'Black';
    const isLowTime = displayTime < 60000; // Less than 1 minute

    useEffect(() => {
      if (!isActive || displayTime <= 0) {
        if (displayTime === 0 && isActive && onTimeExpire) {
          onTimeExpire();
        }
        pulseScale.value = 1; // Reset pulse
        return;
      }
      const interval = setInterval(() => {
        setDisplayTime(prev => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(interval);
    }, [isActive, displayTime, onTimeExpire, pulseScale]);

    // Pulse animation when time is low
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

    const clockAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    return (
      <Surface
        variant="default"
        style={{
          borderRadius: radiusTokens.md,
          padding: spacingTokens[4],
          backgroundColor: colors.background.primary,
        }}
      >
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          {/* Player Info */}
          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" gap={spacingTokens[2]} style={{ marginBottom: spacingTokens[1] }}>
              <Badge variant={color === 'w' ? 'neutral' : 'primary'} size="sm">
                {colorName}
              </Badge>
              {isActive && (
                <Badge variant="success" size="sm">
                  Your Turn
                </Badge>
              )}
            </Box>
            <Text variant="title" color={colors.foreground.primary} weight="semibold" style={{ fontSize: 16 }}>
              {isSelf ? 'You' : accountId}
            </Text>
            {/* Captured Pieces */}
            {capturedPieces.length > 0 && (
              <Box flexDirection="row" gap={spacingTokens[1]} style={{ marginTop: spacingTokens[1], flexWrap: 'wrap' }}>
                {capturedPieces.map((piece, idx) => (
                  <Text key={`captured-${piece}-${idx}-${Math.random()}`} style={{ fontSize: 18, opacity: 0.8 }}>
                    {PIECE_SYMBOLS[piece.toLowerCase()]}
                  </Text>
                ))}
              </Box>
            )}
          </Box>

          {/* Clock */}
          <Animated.View style={clockAnimatedStyle}>
            <Box
              backgroundColor={isLowTime ? colors.error : colors.background.tertiary}
              radius="md"
              padding={3}
              style={{
                minWidth: 80,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                variant="title"
                color={isLowTime ? colors.background.primary : colors.foreground.primary}
                weight="bold"
                style={{ 
                  fontFamily: fonts.mono, 
                  fontSize: isActive ? 24 : 20, 
                  textAlign: 'center', 
                  letterSpacing: 1.5 
                }}
              >
                {formatClock(displayTime)}
              </Text>
            </Box>
          </Animated.View>
        </Box>
      </Surface>
    );
  }
);

PlayerPanel.displayName = 'PlayerPanel';
