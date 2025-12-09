import { StyleSheet } from 'react-native';
import { InteractivePressable, Box, Text, IconSymbol, useThemeTokens, spacingScale, radiusTokens, getSidebarWidthForBreakpoint, getCurrentBreakpoint, SegmentedControl } from '@/ui';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

export interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  headerTitle?: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  onItemPress?: (item: SidebarItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, onItemPress }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, mode, setMode } = useThemeTokens();
  const { isAuthenticated, user, logout } = useAuth();

  const handlePress = (item: SidebarItem) => {
    onItemPress?.(item);
    router.push(item.route as any);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const bp = getCurrentBreakpoint();
  const sidebarWidth = getSidebarWidthForBreakpoint(bp);

  return (
    <Box
      style={{
        ...styles.container,
        width: sidebarWidth > 0 ? sidebarWidth : '100%',
        backgroundColor: mode === 'dark' ? colors.background.primary : colors.background.secondary,
      }}
    >
      {/* Header */}
      <Box
        padding={4}
        style={{
          ...styles.header,
          borderBottomColor: colors.background.tertiary,
        }}
      >
        <Text variant="title" weight="bold" size="xl">
          ChessMate
        </Text>
      </Box>

      {/* Navigation Items */}
      <Box style={styles.nav}>
        {items.map((item) => (
          <SidebarListItem
            key={item.id}
            item={item}
            isActive={pathname === item.route || pathname.startsWith(item.route + '/')}
            onPress={() => handlePress(item)}
          />
        ))}
      </Box>

      {/* Auth Section at Bottom */}
      <Box
        padding={3}
        style={{
          ...styles.authSection,
          borderTopColor: colors.background.tertiary,
        }}
      >
        {/* Theme control - DLS SegmentedControl (light / dark) */}
        <Box style={{ marginBottom: spacingScale.sm }}>
          <SegmentedControl
            segments={[ 'light', 'dark' ]}
            selectedSegment={mode === 'dark' ? 'dark' : 'light'}
            onSegmentChange={(s) => setMode(s as any)}
            labelFormatter={(s) => (s === 'light' ? '☀' : '🌙')}
            style={{ width: '100%' }}
          />
        </Box>

        {isAuthenticated ? (
          <>
            {/* User Info */}
            <Box
              padding={3}
              style={{
                ...styles.userInfo,
                backgroundColor: colors.translucent.light,
                borderRadius: radiusTokens.lg,
              }}
            >
              <Box style={{ ...styles.avatar, width: spacingScale.avatarMd, height: spacingScale.avatarMd, borderRadius: spacingScale.avatarMd / 2 }}>
                <Text variant="body" weight="bold" style={{ color: colors.accentForeground.primary }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </Box>
              <Box style={{ flex: 1, marginLeft: spacingScale.md }}>
                <Text variant="body" weight="semibold" style={{ color: colors.foreground.primary }}>
                  {user?.username || 'User'}
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.secondary }}>
                  {user?.email || ''}
                </Text>
              </Box>
            </Box>

            {/* Logout Button */}
            <InteractivePressable
              onPress={handleLogout}
              style={{
                ...styles.authButton,
                backgroundColor: colors.translucent.dark,
                borderRadius: radiusTokens.md,
              }}
            >
              <IconSymbol name="arrow.right.square" size={20} color={colors.foreground.secondary} />
              <Text
                variant="body"
                weight="medium"
                style={{ color: colors.foreground.secondary, marginLeft: spacingScale.sm }}
              >
                Logout
              </Text>
            </InteractivePressable>
          </>
        ) : (
          <>
            {/* Login Button */}
            <InteractivePressable
              onPress={() => router.push('/login')}
              style={{
                ...styles.authButton,
                backgroundColor: colors.accent.primary,
                borderRadius: radiusTokens.md,
              }}
            >
              <IconSymbol name="person.fill" size={20} color={colors.accentForeground.primary} />
              <Text
                variant="body"
                weight="semibold"
                style={{ color: colors.accentForeground.primary, marginLeft: spacingScale.sm }}
              >
                Sign In
              </Text>
            </InteractivePressable>

            {/* Sign Up Button */}
            <InteractivePressable
              onPress={() => router.push('/register')}
              style={{
                ...styles.authButton,
                backgroundColor: colors.translucent.dark,
                borderRadius: radiusTokens.md,
              }}
            >
              <IconSymbol name="person.badge.plus" size={20} color={colors.foreground.secondary} />
              <Text
                variant="body"
                weight="medium"
                style={{ color: colors.foreground.secondary, marginLeft: spacingScale.sm }}
              >
                Sign Up
              </Text>
            </InteractivePressable>
          </>
        )}
      </Box>
    </Box>
  );
};

interface SidebarItemProps {
  item: SidebarItem;
  isActive: boolean;
  onPress: () => void;
}

const SidebarListItem: React.FC<SidebarItemProps> = ({ item, isActive, onPress }) => {
  const { colors } = useThemeTokens();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <InteractivePressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Box
          padding={3}
          shadow={isActive ? 'sm' : undefined}
          style={{
            ...styles.item,
            backgroundColor: isActive
              ? colors.translucent.dark
              : 'transparent',
            borderLeftWidth: isActive ? 3 : 0,
            borderLeftColor: isActive ? colors.accent.primary : 'transparent',
          }}
        >
          <Box style={styles.itemContent}>
            <IconSymbol
              name={item.icon as any}
              size={spacingScale.iconSize}
              color={isActive ? colors.accent.primary : colors.foreground.secondary}
            />
            <Text
              variant="body"
              weight={isActive ? 'semibold' : 'normal'}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: isActive ? colors.accent.primary : colors.foreground.secondary,
                marginLeft: spacingScale.md,
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              {item.title}
            </Text>
          </Box>
        </Box>
      </InteractivePressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: spacingScale.md,
  },
  nav: {
    flex: 1,
    paddingTop: spacingScale.sm,
    paddingHorizontal: spacingScale.sm,
  },
  item: {
    marginBottom: spacingScale.xs,
    borderRadius: radiusTokens.lg,
    overflow: 'hidden',
  },
  activeItem: {
    // Inset/pressed effect
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingScale.sm,
    paddingHorizontal: spacingScale.md,
  },
  authSection: {
    borderTopWidth: 1,
    paddingTop: spacingScale.md,
    gap: spacingScale.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingScale.md,
  },
  avatar: {
    width: spacingScale.avatarMd,
    height: spacingScale.avatarMd,
    borderRadius: spacingScale.avatarMd / 2,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.lg,
  },
});
