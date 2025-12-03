/**
 * SegmentedControl Component
 * iOS-style segmented control for filter selection
 * Part of Minimalist Pro design system
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

type SegmentedControlProps<T extends string> = {
  segments: T[];
  selectedSegment: T;
  onSegmentChange: (segment: T) => void;
  style?: any;
};

export function SegmentedControl<T extends string>({
  segments,
  selectedSegment,
  onSegmentChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors, isDark } = useThemeTokens();
  const selectedIndex = segments.indexOf(selectedSegment);
  const segmentWidth = (Dimensions.get('window').width - 48) / segments.length; // Account for padding
  
  const translateX = useSharedValue(selectedIndex * segmentWidth);

  React.useEffect(() => {
    translateX.value = withSpring(selectedIndex * segmentWidth, {
      damping: 20,
      stiffness: 200,
    });
  }, [selectedIndex, segmentWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }, style]}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: segmentWidth,
            backgroundColor: colors.background.primary,
            shadowColor: isDark ? '#000' : '#000',
          },
          indicatorStyle,
        ]}
      />
      
      {/* Segments */}
      {segments.map((segment, index) => {
        const isSelected = segment === selectedSegment;
        return (
          <TouchableOpacity
            key={segment}
            style={[styles.segment, { width: segmentWidth }]}
            onPress={() => onSegmentChange(segment)}
            activeOpacity={0.7}
          >
            <Text
              variant="label"
              weight={isSelected ? 'semibold' : 'medium'}
              style={{
                color: isSelected ? colors.foreground.primary : colors.foreground.secondary,
                textTransform: 'capitalize',
              }}
            >
              {segment}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segment: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
