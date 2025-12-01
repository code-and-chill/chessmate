import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { useState } from 'react';

import { IconSymbol } from '@/ui';
import { Sidebar, type SidebarItem } from '@/ui/components/Sidebar';
import { useThemeTokens } from '@/ui';

const sidebarItems: SidebarItem[] = [
  {
    id: 'play',
    title: 'Play',
    icon: 'gamecontroller.fill',
    route: '/',
    headerTitle: 'Live Chess',
  },
  {
    id: 'puzzle',
    title: 'Puzzle',
    icon: 'brain.head.profile',
    route: '/explore',
    headerTitle: 'Daily Puzzle',
  },
  {
    id: 'learn',
    title: 'Learn',
    icon: 'book.fill',
    route: '/learn',
    headerTitle: 'Lessons & Tactics',
  },
  {
    id: 'watch',
    title: 'Watch',
    icon: 'play.rectangle.fill',
    route: '/watch',
    headerTitle: 'Watch & Streams',
  },
  {
    id: 'social',
    title: 'Social',
    icon: 'person.2.fill',
    route: '/social',
    headerTitle: 'Friends & Clubs',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'gearshape.fill',
    route: '/settings',
    headerTitle: 'Settings',
  },
];

function HeaderActions() {
  const router = useRouter();
  const { mode, setMode, colors } = useThemeTokens();
  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingRight: 12 }}>
      <TouchableOpacity onPress={() => router.push('/search')} accessibilityLabel="Search">
        <IconSymbol size={22} name="magnifyingglass" color={colors.accent.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggle} accessibilityLabel="Toggle Theme">
        <IconSymbol size={22} name={mode === 'dark' ? 'sun.max.fill' : 'moon.fill'} color={colors.accent.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
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
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerRight: () => <HeaderActions />,
            headerStyle: {
              backgroundColor: colors.background.secondary,
            },
            headerTintColor: colors.foreground.primary,
            headerLeft:
              Platform.OS !== 'web'
                ? () => (
                    <TouchableOpacity
                      onPress={() => setSidebarVisible(!sidebarVisible)}
                      style={{ paddingLeft: 12 }}
                      accessibilityLabel="Toggle Menu"
                    >
                      <IconSymbol size={24} name="line.3.horizontal" color={colors.accent.primary} />
                    </TouchableOpacity>
                  )
                : undefined,
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Live Chess' }} />
          <Stack.Screen name="explore" options={{ title: 'Daily Puzzle' }} />
          <Stack.Screen name="learn" options={{ title: 'Lessons & Tactics' }} />
          <Stack.Screen name="watch" options={{ title: 'Watch & Streams' }} />
          <Stack.Screen name="social" options={{ title: 'Friends & Clubs' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </View>

      {/* Overlay for mobile when sidebar is open */}
      {Platform.OS !== 'web' && sidebarVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSidebarVisible(false)}
          accessibilityLabel="Close Menu"
        />
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
    shadowColor: '#000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
});
