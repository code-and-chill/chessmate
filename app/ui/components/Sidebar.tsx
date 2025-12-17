import {StyleSheet, ScrollView} from 'react-native';
import {InteractivePressable} from '@/ui/primitives/InteractivePressable';
import {Box} from '@/ui/primitives/Box';
import {Text} from '@/ui/primitives/Text';
import {IconSymbol} from '@/ui/primitives/icon-symbol';
import {useThemeTokens} from '@/ui/hooks/useThemeTokens';
import {spacingScale} from '@/ui/tokens/spacing';
import {radiusTokens} from '@/ui/tokens/radii';
import {getSidebarWidthForBreakpoint} from '@/ui/tokens/layout';
import {getCurrentBreakpoint} from '@/ui/tokens/breakpoints';
import {SegmentedControl} from '@/ui/components/SegmentedControl';
import {usePathname, useRouter} from 'expo-router';
import Animated, {useAnimatedStyle, useSharedValue, withSpring,} from 'react-native-reanimated';

import {useAuth} from '@/contexts/AuthContext';
import React, {useState} from 'react';

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
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false);

  const bp = getCurrentBreakpoint();
  const sidebarWidth = getSidebarWidthForBreakpoint(bp);

  // Progressive disclosure based on sidebar width:
  // 1. If sidebar >= 200px (xl+) → show avatar + username (full)
  // 2. If sidebar >= 120px (sm+) → show avatar only
  // 3. If sidebar < 120px (xs) → show logout button only
  // This prevents text truncation and shows only what fits cleanly
  const MIN_WIDTH_FOR_USERNAME = 200; // xl breakpoint
  const MIN_WIDTH_FOR_AVATAR = 120;   // sm breakpoint
  
  const canShowUsername = sidebarWidth >= MIN_WIDTH_FOR_USERNAME;
  const canShowAvatar = sidebarWidth >= MIN_WIDTH_FOR_AVATAR;

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

  return (
    <Box
      flex={1}
      flexDirection="column"
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

      {/* Navigation Items - Scrollable */}
      <ScrollView
        style={styles.navScroll}
        contentContainerStyle={styles.navContent}
        showsVerticalScrollIndicator={true}
      >
        {items.map((item) => (
          <SidebarListItem
            key={item.id}
            item={item}
            isActive={pathname === item.route || pathname.startsWith(item.route + '/')}
            onPress={() => handlePress(item)}
          />
        ))}
      </ScrollView>

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
            {/* Progressive Disclosure: Show only what fits */}
            {canShowAvatar && (
              <InteractivePressable
                onPress={() => canShowUsername && setIsUserInfoExpanded(!isUserInfoExpanded)}
                style={{
                  ...styles.userInfo,
                  backgroundColor: colors.translucent.light,
                  borderRadius: radiusTokens.lg,
                  padding: spacingScale.md,
                }}
              >
                <Box style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Box style={{ ...styles.avatar, width: spacingScale.avatarMd, height: spacingScale.avatarMd, borderRadius: spacingScale.avatarMd / 2 }}>
                    <Text variant="body" weight="bold" style={{ color: colors.accentForeground.primary }}>
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </Box>
                  {canShowUsername && (
                    <>
                      <Box style={{ flex: 1, marginLeft: spacingScale.md, minWidth: 0 }}>
                        <Text 
                          variant="body" 
                          weight="semibold" 
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ color: colors.foreground.primary }}
                        >
                          {user?.username || 'User'}
                        </Text>
                        {isUserInfoExpanded && (
                          <Text 
                            variant="caption" 
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{ color: colors.foreground.secondary, marginTop: spacingScale.xs }}
                          >
                            {user?.email || ''}
                          </Text>
                        )}
                      </Box>
                      <IconSymbol
                        name={isUserInfoExpanded ? 'chevron.up' : 'chevron.down'}
                        size={16}
                        color={colors.foreground.secondary}
                        style={{ marginLeft: spacingScale.xs }}
                      />
                    </>
                  )}
                </Box>
              </InteractivePressable>
            )}

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
    borderRightWidth: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: spacingScale.md,
    flexShrink: 0,
  },
  navScroll: {
    flex: 1,
  },
  navContent: {
    paddingTop: spacingScale.sm,
    paddingHorizontal: spacingScale.sm,
    paddingBottom: spacingScale.sm,
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
    flexShrink: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
