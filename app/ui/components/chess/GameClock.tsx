/**
 * GameClock Component
 * app/ui/components/chess/GameClock.tsx
 * 
 * Chess timer with increment support
 * Features: Time display, low-time warning, increment indication, pause state
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { Text } from '../../primitives/Text';
import { colorTokens, getColor } from '../../tokens/colors';
import { spacingTokens } from '../../tokens/spacing';
import { radiusTokens } from '../../tokens/radii';
import { textVariants } from '../../tokens/typography';
import { motionTokens } from '../../tokens/motion';
import { useIsDark } from '../../hooks/useThemeTokens';

type GameClockProps = {
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Increment per move (seconds) */
  increment?: number;
  /** Is this clock active (player's turn) */
  isActive: boolean;
  /** Is the game paused */
  isPaused?: boolean;
  /** Player color for visual context */
  player: 'white' | 'black';
  /** Low time warning threshold (seconds) */
  lowTimeThreshold?: number;
  /** Callback when time runs out */
  onTimeUp?: () => void;
  /** Callback every second */
  onTick?: (timeRemaining: number) => void;
  isDark?: boolean;
};

/**
 * GameClock Component
 * 
 * @example
 * ```tsx
 * <GameClock
 *   timeRemaining={600}
 *   increment={5}
 *   isActive={currentTurn === 'white'}
 *   player="white"
 *   onTimeUp={() => handleTimeout('white')}
 * />
 * ```
 */
export const GameClock: React.FC<GameClockProps> = ({
  timeRemaining,
  increment = 0,
  isActive,
  isPaused = false,
  player,
  lowTimeThreshold = 30,
  onTimeUp,
  onTick,
  isDark: isDarkProp,
}) => {
  const isDarkTheme = useIsDark();
  const isDark = isDarkProp ?? isDarkTheme;
  const [currentTime, setCurrentTime] = useState(timeRemaining);
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const isLowTime = currentTime <= lowTimeThreshold && currentTime > 0;
  const isExpired = currentTime <= 0;

  // Timer logic
  useEffect(() => {
    if (!isActive || isPaused || currentTime <= 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev - 1;
        onTick?.(newTime);

        if (newTime <= 0) {
          onTimeUp?.();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, currentTime, onTick, onTimeUp]);

  // Pulse animation for active clock
  useEffect(() => {
    if (isActive && !isPaused && !isExpired) {
      scale.value = withSequence(
        withSpring(1.05, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [isActive, isPaused, isExpired]);

  // Low time pulse effect
  useEffect(() => {
    if (isLowTime && isActive && !isPaused) {
      pulseOpacity.value = withSequence(
        withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      );
    } else {
      pulseOpacity.value = 0;
    }
  }, [isLowTime, isActive, isPaused, currentTime]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getClockColor = () => {
    if (isExpired) return getColor(colorTokens.red[600], isDark);
    if (isLowTime) return getColor(colorTokens.orange[600], isDark);
    if (isActive) return getColor(colorTokens.green[600], isDark);
    return getColor(colorTokens.neutral[700], isDark);
  };

  const getBackgroundColor = () => {
    if (isExpired) return getColor(colorTokens.red[50], isDark);
    if (isLowTime && isActive) return getColor(colorTokens.orange[50], isDark);
    if (isActive) return getColor(colorTokens.green[50], isDark);
    return getColor(colorTokens.neutral[100], isDark);
  };

  const getBorderColor = () => {
    if (isExpired) return getColor(colorTokens.red[600], isDark);
    if (isLowTime && isActive) return getColor(colorTokens.orange[600], isDark);
    if (isActive) return getColor(colorTokens.green[600], isDark);
    return getColor(colorTokens.neutral[300], isDark);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isActive ? 2 : 1,
        },
      ]}
      accessibilityRole="timer"
      accessibilityLabel={`${player === 'white' ? 'White' : 'Black'} player clock: ${formatTime(currentTime)}`}
      accessibilityState={{
        disabled: !isActive || isPaused,
      }}
    >
      {/* Low time pulse effect */}
      {isLowTime && isActive && (
        <Animated.View
          style={[
            styles.pulseOverlay,
            animatedPulseStyle,
            {
              backgroundColor: getColor(colorTokens.orange[600], isDark),
            },
          ]}
        />
      )}

      <View style={styles.content}>
        <Text
          {...textVariants.display}
          style={[
            styles.timeText,
            {
              color: getClockColor(),
              fontSize: isLowTime ? 36 : 32,
            },
          ]}
          accessibilityLabel={`Time: ${formatTime(currentTime)}`}
        >
          {formatTime(currentTime)}
        </Text>

        {increment > 0 && (
          <View
            style={[
              styles.incrementBadge,
              {
                backgroundColor: getColor(colorTokens.blue[100], isDark),
              },
            ]}
          >
            <Text
              {...textVariants.caption}
              style={{
                color: getColor(colorTokens.blue[700], isDark),
                fontWeight: '600',
              }}
            >
              +{increment}s
            </Text>
          </View>
        )}

        {isPaused && (
          <View
            style={[
              styles.pausedBadge,
              {
                backgroundColor: getColor(colorTokens.neutral[200], isDark),
              },
            ]}
          >
            <Text
              {...textVariants.caption}
              style={{
                color: getColor(colorTokens.neutral[700], isDark),
                fontWeight: '600',
              }}
            >
              PAUSED
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radiusTokens.md,
    padding: spacingTokens[4],
    position: 'relative',
    overflow: 'hidden',
    minWidth: 120,
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radiusTokens.md,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  timeText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  incrementBadge: {
    marginTop: spacingTokens[1],
    paddingHorizontal: spacingTokens[2],
    paddingVertical: spacingTokens[1],
    borderRadius: radiusTokens.sm,
  },
  pausedBadge: {
    position: 'absolute',
    top: -spacingTokens[2],
    right: -spacingTokens[2],
    paddingHorizontal: spacingTokens[2],
    paddingVertical: spacingTokens[1],
    borderRadius: radiusTokens.sm,
  },
});
