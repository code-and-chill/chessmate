/**
 * List Primitive Component
 * app/ui/primitives/List.tsx
 * 
 * Production-grade list with items, separators, and states
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from './Text';
import { spacingTokens, spacingScale } from '../tokens/spacing';
import { radiusTokens } from '../tokens/radii';
import { microInteractions } from '../tokens/motion';
import { colorTokens, getColor } from '../tokens/colors';

// ==================== TYPES ====================

export type ListItemProps = {
  title: string;
  subtitle?: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  animated?: boolean;
  isDark?: boolean;
  style?: ViewStyle;
};

export type ListProps = {
  children: React.ReactNode;
  divided?: boolean;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  isDark?: boolean;
  style?: ViewStyle;
};

export type ListSectionProps = {
  title?: string;
  children: React.ReactNode;
  isDark?: boolean;
};

// ==================== LIST ITEM ====================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leading,
  trailing,
  onPress,
  selected = false,
  disabled = false,
  animated = true,
  isDark = false,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }), []);

  const handlePressIn = () => {
    if (animated && !disabled && onPress) {
      scale.value = withSpring(microInteractions.scalePress, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const handlePressOut = () => {
    if (animated) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const backgroundColor = selected
    ? getColor(colorTokens.blue[50], isDark)
    : 'transparent';

  const Wrapper = onPress ? AnimatedPressable : View;

  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.listItem,
        {
          backgroundColor,
          opacity: disabled ? microInteractions.opacityDisabled : 1,
        },
        animated && animatedStyle,
        style,
      ]}
    >
      {/* Leading element (icon, avatar, checkbox) */}
      {leading && <View style={styles.leading}>{leading}</View>}

      {/* Content */}
      <View style={styles.content}>
        <Text
          size="base"
          weight={selected ? 'semibold' : 'normal'}
          color={getColor(colorTokens.neutral[900], isDark)}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            size="sm"
            color={getColor(colorTokens.neutral[600], isDark)}
            numberOfLines={1}
            style={{ marginTop: 2 }}
          >
            {subtitle}
          </Text>
        )}
        
        {description && (
          <Text
            size="sm"
            color={getColor(colorTokens.neutral[500], isDark)}
            numberOfLines={2}
            style={{ marginTop: 4 }}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Trailing element (chevron, badge, action) */}
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </Wrapper>
  );
};

ListItem.displayName = 'ListItem';

// ==================== LIST ====================

const spacingMap = {
  none: 0,
  sm: spacingTokens[2],
  md: spacingTokens[3],
  lg: spacingTokens[4],
};

export const List: React.FC<ListProps> = ({
  children,
  divided = false,
  spacing = 'none',
  isDark = false,
  style,
}) => {
  const gap = spacingMap[spacing];

  return (
    <View style={[styles.list, { gap }, style]}>
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {divided && index < React.Children.count(children) - 1 && (
            <View
              style={[
                styles.divider,
                { backgroundColor: getColor(colorTokens.neutral[200], isDark) },
              ]}
            />
          )}
        </>
      ))}
    </View>
  );
};

List.displayName = 'List';

// ==================== LIST SECTION ====================

export const ListSection: React.FC<ListSectionProps> = ({
  title,
  children,
  isDark = false,
}) => {
  return (
    <View style={styles.section}>
      {title && (
        <Text
          size="xs"
          weight="semibold"
          color={getColor(colorTokens.neutral[600], isDark)}
          style={styles.sectionTitle}
        >
          {title.toUpperCase()}
        </Text>
      )}
      {children}
    </View>
  );
};

ListSection.displayName = 'ListSection';

// ==================== STYLES ====================

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.lg,
    minHeight: spacingScale.rowHeight,
    borderRadius: radiusTokens.md,
  },
  
  leading: {
    marginRight: spacingScale.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  
  trailing: {
    marginLeft: spacingScale.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  divider: {
    height: 1,
    marginHorizontal: spacingScale.lg,
  },
  
  section: {
    marginBottom: spacingScale.lg,
  },
  
  sectionTitle: {
    paddingHorizontal: spacingScale.lg,
    paddingBottom: spacingTokens[2],
    letterSpacing: 0.5,
  },
});
