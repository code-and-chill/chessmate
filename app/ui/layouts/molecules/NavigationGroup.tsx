/**
 * NavigationGroup - Molecular Layout Component
 * 
 * Composes atomic components into a reusable navigation group molecule.
 * Follows atomic design principles and progressive disclosure patterns.
 * 
 * @packageDocumentation
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { spacingScale, layoutSpacing, touchTargets } from '@/ui/tokens/spacing';
import type { ViewStyle } from 'react-native';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

export interface NavigationGroupProps {
  /** Navigation items to display */
  items: NavItem[];
  /** Currently active route */
  currentRoute?: string;
  /** Whether items are secondary (indented) */
  isSecondary?: boolean;
  /** Whether group is expanded (for progressive disclosure) */
  isExpanded?: boolean;
  /** Handler for navigation */
  onNavigate: (route: string) => void;
  /** Handler for badge press */
  onBadgePress?: (itemId: string) => void;
  /** Colors from theme */
  colors: {
    background: { primary: string };
    foreground: { primary: string; secondary: string };
    accent: { primary: string };
    accentForeground: { primary: string };
    error: string;
    border: string;
  };
  /** Fonts from theme */
  fonts: {
    displayMedium: string;
    primaryMedium: string;
  };
  /** Custom style */
  style?: ViewStyle;
}

/**
 * NavigationGroup Component
 * 
 * Molecular component that displays a group of navigation items.
 * Supports progressive disclosure and visual hierarchy.
 * 
 * @example
 * ```tsx
 * <NavigationGroup
 *   items={primaryNavItems}
 *   currentRoute="/"
 *   onNavigate={handleNavigate}
 *   colors={colors}
 *   fonts={fonts}
 * />
 * ```
 */
export const NavigationGroup: React.FC<NavigationGroupProps> = ({
  items,
  currentRoute = '/',
  isSecondary = false,
  isExpanded = true,
  onNavigate,
  onBadgePress,
  colors,
  fonts,
  style,
}) => {
  const isActive = (route: string) => currentRoute === route;

  return (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const active = isActive(item.route);
        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.navItem,
              isSecondary && styles.secondaryNavItem,
              active && styles.navItemActive,
              { backgroundColor: active ? colors.accent.primary : 'transparent' },
              pressed && styles.navItemPressed,
            ]}
            onPress={() => onNavigate(item.route)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
          >
            <IconSymbol
              name={item.icon as any}
              size={24}
              color={active ? colors.accentForeground.primary : colors.foreground.secondary}
            />
            <Text style={[
              styles.navLabel,
              { fontFamily: fonts.displayMedium, color: active ? colors.accentForeground.primary : colors.foreground.primary }
            ]}>
              {item.label}
            </Text>
            {item.badge !== undefined && item.badge > 0 && (
              <Pressable
                style={[styles.badge, { backgroundColor: colors.error, paddingHorizontal: layoutSpacing.badgePadding }]}
                onPress={() => onBadgePress?.(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.badge} notifications`}
              >
                <Text style={[styles.badgeText, { fontFamily: fonts.primaryMedium }]}>{item.badge}</Text>
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacingScale.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.md,
    borderRadius: 8,
    gap: spacingScale.md,
  },
  secondaryNavItem: {
    paddingLeft: spacingScale.xl, // Indent to show hierarchy
  },
  navItemActive: {},
  navItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    minWidth: touchTargets.minimum,
    minHeight: touchTargets.minimum,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

NavigationGroup.displayName = 'NavigationGroup';
