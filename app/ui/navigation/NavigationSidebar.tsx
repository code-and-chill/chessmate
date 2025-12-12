import type React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { useFonts, useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingScale, layoutSpacing, touchTargets } from '@/ui/tokens/spacing';
import { getCurrentBreakpoint } from '@/ui/tokens/breakpoints';
import { getSidebarWidthForBreakpoint } from '@/ui/tokens/layout';
import { elevationTokens, SegmentedControl } from '@/ui';

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
  
  // Progressive disclosure: Group navigation items to reduce choice overload (Hick's Law)
  // Primary navigation items (always visible)
  const primaryNavItems: NavItem[] = [
    { id: 'play', label: 'Play', icon: 'gamecontroller.fill', route: '/' },
    { id: 'puzzles', label: 'Puzzles', icon: 'brain.head.profile', route: '/explore' },
  ];
  
  // Secondary navigation items (collapsible - progressive disclosure)
  const secondaryNavItems: NavItem[] = [
    { id: 'learn', label: 'Learn', icon: 'book.fill', route: '/learn' },
    { id: 'watch', label: 'Watch', icon: 'play.rectangle.fill', route: '/watch' },
    { id: 'social', label: 'Social', icon: 'person.2.fill', route: '/social' },
  ];
  
  // State for progressive disclosure
  const [showSecondaryNav, setShowSecondaryNav] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Quick actions (hidden by default - shown on demand)
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

      {/* Primary Navigation Items (always visible) */}
      <View style={styles.navSection}>
        {primaryNavItems.map((item) => {
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
                <Pressable
                  style={[styles.badge, { backgroundColor: colors.error, paddingHorizontal: layoutSpacing.badgePadding }]}
                  onPress={() => {/* Badge tap handler if needed */}}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.badge} notifications`}
                >
                  <Text style={[styles.badgeText, { fontFamily: fonts.primaryMedium }]}>{item.badge}</Text>
                </Pressable>
              )}
            </Pressable>
          );
        })}
        
        {/* Secondary Navigation (progressive disclosure) */}
        {secondaryNavItems.length > 0 && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => setShowSecondaryNav(!showSecondaryNav)}
              accessibilityRole="button"
              accessibilityLabel={showSecondaryNav ? 'Hide more options' : 'Show more options'}
              accessibilityState={{ expanded: showSecondaryNav }}
            >
              <IconSymbol
                name={showSecondaryNav ? 'chevron.up' : 'chevron.down'}
                size={20}
                color={colors.foreground.secondary}
              />
              <Text style={[
                styles.navLabel,
                { fontFamily: fonts.displayMedium, color: colors.foreground.secondary }
              ]}>
                More
              </Text>
            </Pressable>
            
            {showSecondaryNav && secondaryNavItems.map((item) => {
              const active = isActive(item.route);
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.navItem,
                    styles.secondaryNavItem,
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
                    <Pressable
                      style={[styles.badge, { backgroundColor: colors.error, paddingHorizontal: layoutSpacing.badgePadding }]}
                      onPress={() => {/* Badge tap handler if needed */}}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.badge} notifications`}
                    >
                      <Text style={[styles.badgeText, { fontFamily: fonts.primaryMedium }]}>{item.badge}</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
          </>
        )}
      </View>

      {/* Theme Control (light / dark) - Moved to less prominent position */}
      <View style={styles.themeControlWrap}>
        <Pressable
          style={styles.themeIconButton}
          onPress={() => setMode('light' as any)}
          accessibilityRole="button"
          accessibilityLabel="Light mode"
        >
          <IconSymbol 
            name="sun.max.fill" 
            size={touchTargets.icon.small} 
            color={mode === 'light' ? colors.accent.primary : colors.foreground.secondary} 
          />
        </Pressable>
        <SegmentedControl
          segments={[ 'light', 'dark' ]}
          selectedSegment={mode === 'dark' ? 'dark' : 'light'}
          onSegmentChange={(s) => setMode(s as any)}
          labelFormatter={(s) => (s === 'light' ? '☀' : '🌙')}
          style={{ marginHorizontal: spacingScale.sm, minWidth: 120 }}
        />
        <Pressable
          style={styles.themeIconButton}
          onPress={() => setMode('dark' as any)}
          accessibilityRole="button"
          accessibilityLabel="Dark mode"
        >
          <IconSymbol 
            name="moon.fill" 
            size={touchTargets.icon.small} 
            color={mode === 'dark' ? colors.accent.primary : colors.foreground.secondary} 
          />
        </Pressable>
      </View>

      {/* Quick Actions (progressive disclosure - hidden by default) */}
      {showQuickActions && (
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
      )}
      
      {/* Primary Quick Action (always visible - reduces choice overload) */}
      <View style={styles.primaryActionSection}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryActionButton,
            { backgroundColor: colors.accent.primary },
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => router.push('/play/new' as any)}
          accessibilityRole="button"
          accessibilityLabel="New Game"
        >
          <IconSymbol
            name="plus.circle.fill"
            size={20}
            color={colors.accentForeground.primary}
          />
          <Text style={[
            styles.actionLabel,
            styles.actionLabelPrimary,
            { fontFamily: fonts.primaryMedium, color: colors.accentForeground.primary }
          ]}>
            New Game
          </Text>
        </Pressable>
        
        {/* Toggle to show more quick actions */}
        {quickActions.length > 1 && (
          <Pressable
            style={styles.moreActionsButton}
            onPress={() => setShowQuickActions(!showQuickActions)}
            accessibilityRole="button"
            accessibilityLabel={showQuickActions ? 'Hide more actions' : 'Show more actions'}
          >
            <IconSymbol
              name={showQuickActions ? 'chevron.up' : 'chevron.down'}
              size={16}
              color={colors.foreground.secondary}
            />
          </Pressable>
        )}
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
    zIndex: elevationTokens.surface4.zIndex,
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
    minWidth: touchTargets.minimum,
    minHeight: touchTargets.minimum,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIconButton: {
    width: touchTargets.iconHitArea,
    height: touchTargets.iconHitArea,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
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
  primaryActionSection: {
    marginTop: spacingScale.lg,
    gap: spacingScale.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.md,
    borderRadius: 8,
    gap: spacingScale.sm,
    flex: 1,
  },
  moreActionsButton: {
    width: touchTargets.iconHitArea,
    height: touchTargets.iconHitArea,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: touchTargets.iconHitArea / 2,
  },
  secondaryNavItem: {
    paddingLeft: spacingScale.xl, // Indent to show hierarchy
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
