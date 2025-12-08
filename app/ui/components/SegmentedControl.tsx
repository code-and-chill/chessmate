import React, {useState, useRef} from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

type SegmentedControlProps<T extends string> = {
  segments: T[];
  selectedSegment: T;
  onSegmentChange: (segment: T) => void;
  style?: any;
  /** Optional formatter for segment labels (e.g., localization) */
  labelFormatter?: (segment: T) => string;
};

export function SegmentedControl<T extends string>({
  segments,
  selectedSegment,
  onSegmentChange,
  style,
  labelFormatter,
}: SegmentedControlProps<T>) {
  const { colors, isDark } = useThemeTokens();
  const selectedIndex = segments.indexOf(selectedSegment);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const segmentWidth = (containerWidth && containerWidth > 0)
    ? Math.max((containerWidth - 6) / segments.length, 0) // account for container padding (3 left+right)
    : Math.max(0, 0);

   const translateX = useSharedValue(selectedIndex * segmentWidth);

   React.useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withSpring(selectedIndex * segmentWidth, {
        damping: 20,
        stiffness: 200,
      });
    }
   }, [selectedIndex, segmentWidth, translateX]);

   const indicatorStyle = useAnimatedStyle(() => ({
     transform: [{ translateX: translateX.value }],
   }));

   const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== containerWidth) setContainerWidth(w);
  };

  return (
    <View onLayout={handleLayout} style={[styles.container, { backgroundColor: colors.background.secondary }, style]}>
       {/* Animated indicator */}
       <Animated.View
         style={[
           styles.indicator,
           {
            width: segmentWidth || '100%',
             backgroundColor: colors.background.primary,
             shadowColor: isDark ? '#000' : '#000',
           },
           indicatorStyle,
         ]}
         pointerEvents="none"
       />

       {/* Segments */}
       {segments.map((segment) => {
         const isSelected = segment === selectedSegment;
         return (
          <TouchableOpacity
            key={segment}
            style={[styles.segment, { width: segmentWidth || undefined, zIndex: 2 }]}
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
              {labelFormatter ? labelFormatter(segment) : segment}
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
