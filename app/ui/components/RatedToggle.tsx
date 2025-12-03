/**
 * RatedToggle - Segmented control for rated/casual game selection
 * 
 * Usage:
 * ```tsx
 * <RatedToggle
 *   value={rated}
 *   onChange={setRated}
 *   disabled={isLocalGame}
 *   autoReason={isLocalGame ? 'LOCAL_AUTO' : null}
 * />
 * ```
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Text } from '../primitives/Text';
import { useColors } from '../hooks/useThemeTokens';
import { spacingTokens, radiusTokens } from '../index';
import type { DecisionReason } from '../../features/game/types/DecisionReason';
import { getDecisionReasonMessage, getDecisionReasonIcon } from '../../features/game/types/DecisionReason';

type RatedToggleProps = {
  value: boolean;
  onChange: (rated: boolean) => void;
  disabled?: boolean;
  autoReason?: DecisionReason | null;
};

export const RatedToggle: React.FC<RatedToggleProps> = ({
  value,
  onChange,
  disabled = false,
  autoReason = null,
}) => {
  const colors = useColors();
  const translateX = useSharedValue(value ? 0 : 1);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 0 : 1, {
      damping: 20,
      stiffness: 200,
    });
  }, [value]);

  const indicatorStyle = useAnimatedStyle(() => {
    const containerWidth = 200; // Approximate width
    const segmentWidth = containerWidth / 2;
    return {
      transform: [{ translateX: translateX.value * segmentWidth }],
    };
  });

  const handlePress = (rated: boolean) => {
    if (!disabled) {
      onChange(rated);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background.secondary },
          disabled && styles.containerDisabled,
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: disabled ? colors.foreground.muted : colors.accent.primary },
            indicatorStyle,
          ]}
        />
        
        <TouchableOpacity
          style={styles.segment}
          onPress={() => handlePress(true)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text
            variant="label"
            weight={value ? 'semibold' : 'medium'}
            style={{
              color: value
                ? (disabled ? colors.foreground.secondary : '#FFFFFF')
                : colors.foreground.primary,
            }}
          >
            ⭐ Rated
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.segment}
          onPress={() => handlePress(false)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text
            variant="label"
            weight={!value ? 'semibold' : 'medium'}
            style={{
              color: !value
                ? (disabled ? colors.foreground.secondary : '#FFFFFF')
                : colors.foreground.primary,
            }}
          >
            🎮 Casual
          </Text>
        </TouchableOpacity>
      </View>

      {autoReason && (
        <View style={styles.reasonBadge}>
          <RNText style={[styles.reasonText, { color: colors.foreground.muted }]}>
            {getDecisionReasonIcon(autoReason)} {getDecisionReasonMessage(autoReason)}
          </RNText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacingTokens[2],
  },
  container: {
    flexDirection: 'row',
    height: 44,
    borderRadius: radiusTokens.md,
    padding: 4,
    position: 'relative',
    width: 200,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '47%',
    height: 36,
    borderRadius: radiusTokens.md - 2,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  reasonBadge: {
    paddingHorizontal: spacingTokens[3],
    paddingVertical: spacingTokens[2],
    borderRadius: radiusTokens.sm,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
