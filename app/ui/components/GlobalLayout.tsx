import type { ReactNode } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { Sidebar, type SidebarItem } from './Sidebar';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

const sidebarItems: SidebarItem[] = [
  {
    id: 'play',
    title: 'Play',
    icon: 'gamecontroller.fill',
    route: '/',
  },
  {
    id: 'puzzle',
    title: 'Puzzle',
    icon: 'brain.head.profile',
    route: '/puzzle',
  },
  {
    id: 'learn',
    title: 'Learn',
    icon: 'book.fill',
    route: '/learn',
  },
  {
    id: 'social',
    title: 'Social',
    icon: 'person.2.fill',
    route: '/social/friends',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'gearshape.fill',
    route: '/settings',
  },
];

interface GlobalLayoutProps {
  children: ReactNode;
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const { colors, mode } = useThemeTokens();
  const [sidebarVisible, setSidebarVisible] = useState(Platform.OS === 'web');

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Sidebar - visible on web, toggleable on mobile */}
      {(sidebarVisible || Platform.OS === 'web') && (
        <View
          style={[
            styles.sidebar,
            Platform.OS !== 'web' && styles.sidebarMobile,
            {
              backgroundColor: mode === 'dark' ? colors.background.primary : colors.background.secondary,
              borderRightColor: colors.background.tertiary,
            },
          ]}
        >
          <Sidebar items={sidebarItems} onItemPress={() => Platform.OS !== 'web' && setSidebarVisible(false)} />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>{children}</View>

      {/* Overlay for mobile when sidebar is open */}
      {Platform.OS !== 'web' && sidebarVisible && (
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setSidebarVisible(false)}
          accessibilityLabel="Close Menu"
        />
      )}

      {/* Mobile hamburger menu button - floating */}
      {Platform.OS !== 'web' && !sidebarVisible && (
        <TouchableOpacity
          style={[styles.hamburger, { backgroundColor: colors.accent.primary }]}
          onPress={() => setSidebarVisible(true)}
          accessibilityLabel="Open Menu"
        >
          <IconSymbol size={24} name="line.3.horizontal" color={colors.accentForeground.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    borderRightWidth: 1,
    ...Platform.select({
      web: {
        width: 240,
        position: 'relative',
      },
    }),
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    width: 240,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  hamburger: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
