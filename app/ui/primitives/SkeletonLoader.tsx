import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { colors, isDark } = useThemeTokens();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.5, 0.3]
    );

    return {
      opacity,
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.08)',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(0, 0, 0, 0.12)',
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

type SkeletonCardProps = {
  lines?: number;
  showAvatar?: boolean;
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
}) => {
  return (
    <View style={styles.card}>
      {showAvatar && (
        <View style={styles.header}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={styles.headerText}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      )}
      <View style={styles.content}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '70%' : '100%'}
            height={12}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
    </View>
  );
};

type SkeletonListProps = {
  count?: number;
  showAvatars?: boolean;
};

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  showAvatars = false,
}) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} showAvatar={showAvatars} lines={2} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  content: {
    // Empty by design
  },
  list: {
    // Empty by design
  },
});
