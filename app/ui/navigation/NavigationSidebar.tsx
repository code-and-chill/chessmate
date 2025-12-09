import type React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { ZIndex } from '@/core/constants';
import { useFonts, useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingScale } from '@/ui/tokens/spacing';
import { getCurrentBreakpoint } from '@/ui/tokens/breakpoints';
import { getSidebarWidthForBreakpoint } from '@/ui/tokens/layout';
import { SegmentedControl } from '@/ui';

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
  const { colors } = useThemeTokens();
  const fonts = useFonts();
  const { mode, setMode } = useThemeTokens();

  const bp = getCurrentBreakpoint();
  const sidebarWidth = getSidebarWidthForBreakpoint(bp);

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
      onPress: () => router.push('/play/new' as any),
    },
    {
      id: 'play-bot',
      label: 'Play Bot',
      icon: 'cpu',
      variant: 'secondary',
      onPress: () => router.push('/play/bot' as any),
    },
  ];

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    return currentRoute === route;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary, width: sidebarWidth, borderRightColor: colors.border }]}>
      {/* Logo/Brand */}
      <View style={styles.header}>
        <Text style={[styles.logo, { fontFamily: fonts.display, color: colors.accent.primary } ]}>♔ ChessMate</Text>
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
                { backgroundColor: active ? colors.accent.primary : 'transparent' },
                pressed && styles.navItemPressed,
              ]}
              onPress={() => handleNavigate(item.route)}
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
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={[styles.badgeText, { fontFamily: fonts.primaryMedium }]}>{item.badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Theme Control (light / dark) */}
      <View style={styles.themeControlWrap}>
        <IconSymbol name="sun.max.fill" size={16} color={mode === 'light' ? colors.accent.primary : colors.foreground.secondary} />
        <SegmentedControl
          segments={[ 'light', 'dark' ]}
          selectedSegment={mode === 'dark' ? 'dark' : 'light'}
          onSegmentChange={(s) => setMode(s as any)}
          labelFormatter={(s) => (s === 'light' ? '☀' : '🌙')}
          style={{ marginHorizontal: spacingScale.sm, minWidth: 120 }}
        />
        <IconSymbol name="moon.fill" size={16} color={mode === 'dark' ? colors.accent.primary : colors.foreground.secondary} />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { fontFamily: fonts.primaryMedium, color: colors.foreground.secondary }]}>Quick Actions</Text>
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.actionButton,
              action.variant === 'primary' && [
                styles.actionButtonPrimary,
                { backgroundColor: colors.accent.primary }
              ],
              action.variant === 'secondary' && [
                styles.actionButtonSecondary,
                { borderColor: colors.accent.primary }
              ],
              pressed && styles.actionButtonPressed,
            ]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <IconSymbol
              name={action.icon as any}
              size={20}
              color={action.variant === 'primary' ? colors.accentForeground.primary : colors.foreground.secondary}
            />
            <Text style={[
              styles.actionLabel,
              { fontFamily: fonts.primaryMedium },
              action.variant === 'primary' && styles.actionLabelPrimary,
              action.variant === 'secondary' && [
                styles.actionLabelSecondary,
                { color: colors.accent.primary }
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
        <IconSymbol name="gearshape.fill" size={24} color={colors.foreground.secondary} />
        <Text style={[styles.navLabel, { color: colors.foreground.primary }]}>Settings</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingVertical: spacingScale.xl,
    paddingHorizontal: spacingScale.md,
    borderRightWidth: 1,
    zIndex: ZIndex.sidebar,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
      },
    }),
  },
  header: {
    paddingVertical: spacingScale.xl,
    paddingHorizontal: spacingScale.sm,
    marginBottom: spacingScale.xl,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navSection: {
    flex: 1,
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
  },
  actionsSection: {
    marginTop: spacingScale.xl,
    gap: spacingScale.sm,
  },
  themeControlWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingScale.sm,
    paddingVertical: spacingScale.xs,
    gap: spacingScale.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacingScale.sm,
    paddingHorizontal: spacingScale.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.md,
    borderRadius: 8,
    gap: spacingScale.sm,
  },
  actionButtonPrimary: {},
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
  },
  actionLabelPrimary: {
    color: '#fff',
  },
  actionLabelSecondary: {},
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.md,
    borderRadius: 8,
    gap: spacingScale.md,
    marginTop: spacingScale.xl,
    borderTopWidth: 1,
    paddingTop: spacingScale.xl,
  },
});
