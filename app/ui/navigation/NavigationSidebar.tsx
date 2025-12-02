import type React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable, Platform, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { Colors, Spacing, ZIndex } from '@/core/constants';
import { useFonts } from '@/ui';

export interface NavigationSidebarProps {
  currentRoute?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

/**
 * NavigationSidebar Component
 * Vertical sidebar navigation with persistent actions
 * Desktop-only component for improved navigation flow
 */
export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ currentRoute = '/' }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fonts = useFonts();

  const navigationItems: NavItem[] = [
    { id: 'play', label: 'Play', icon: 'gamecontroller.fill', route: '/' },
    { id: 'puzzles', label: 'Puzzles', icon: 'brain.head.profile', route: '/explore' },
    { id: 'learn', label: 'Learn', icon: 'book.fill', route: '/learn' },
    { id: 'watch', label: 'Watch', icon: 'play.rectangle.fill', route: '/watch' },
    { id: 'social', label: 'Social', icon: 'person.2.fill', route: '/social' },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'new-game',
      label: 'New Game',
      icon: 'plus.circle.fill',
      variant: 'primary',
      onPress: () => router.push('/play/new'),
    },
    {
      id: 'play-bot',
      label: 'Play Bot',
      icon: 'cpu',
      variant: 'secondary',
      onPress: () => router.push('/play/bot'),
    },
  ];

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  const isActive = (route: string) => {
    return currentRoute === route;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo/Brand */}
      <View style={styles.header}>
        <Text style={[styles.logo, { fontFamily: fonts.display, color: colors.tint }]}>♔ ChessMate</Text>
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        {navigationItems.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                { backgroundColor: active ? colors.tint : 'transparent' },
                pressed && styles.navItemPressed,
              ]}
              onPress={() => handleNavigate(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
            >
              <IconSymbol
                name={item.icon}
                size={24}
                color={active ? '#fff' : colors.icon}
              />
              <Text style={[
                styles.navLabel,
                { fontFamily: fonts.medium, color: active ? '#fff' : colors.text }
              ]}>
                {item.label}
              </Text>
              {item.badge !== undefined && item.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: '#FF3B30' }]}>
                  <Text style={[styles.badgeText, { fontFamily: fonts.semibold }]}>{item.badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { fontFamily: fonts.semibold, color: colors.icon }]}>Quick Actions</Text>
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.actionButton,
              action.variant === 'primary' && [
                styles.actionButtonPrimary,
                { backgroundColor: colors.tint }
              ],
              action.variant === 'secondary' && [
                styles.actionButtonSecondary,
                { borderColor: colors.tint }
              ],
              pressed && styles.actionButtonPressed,
            ]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <IconSymbol
              name={action.icon}
              size={20}
              color={action.variant === 'primary' ? '#fff' : colors.tint}
            />
            <Text style={[
              styles.actionLabel,
              { fontFamily: fonts.semibold },
              action.variant === 'primary' && styles.actionLabelPrimary,
              action.variant === 'secondary' && [
                styles.actionLabelSecondary,
                { color: colors.tint }
              ],
            ]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Settings Link */}
      <Pressable
        style={({ pressed }) => [
          styles.settingsButton,
          pressed && styles.navItemPressed,
        ]}
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <IconSymbol name="gearshape.fill" size={24} color={colors.icon} />
        <Text style={[styles.navLabel, { color: colors.text }]}>Settings</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    zIndex: ZIndex.sidebar,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
      },
    }),
  },
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    // fontFamily from theme
  },
  navSection: {
    flex: 1,
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    gap: Spacing.md,
  },
  navItemActive: {
    // backgroundColor set dynamically
  },
  navItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    // fontFamily from theme
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    // fontFamily from theme
  },
  actionsSection: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    // fontFamily from theme
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  actionButtonPrimary: {
    // backgroundColor set dynamically
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    // fontFamily from theme
  },
  actionLabelPrimary: {
    color: '#fff',
  },
  actionLabelSecondary: {
    // color set dynamically
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    gap: Spacing.md,
    marginTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: Spacing.xl,
  },
});
