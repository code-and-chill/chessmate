/**
 * Sidebar Component - Modern AI-Aesthetic Navigation
 * app/ui/components/Sidebar.tsx
 * 
 * A sidebar navigation component with soft shadows and glassmorphism
 */

import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { IconSymbol } from '../primitives/icon-symbol';
import { useThemeTokens } from '../hooks/useThemeTokens';
import { spacingTokens } from '../tokens/spacing';
import { radiusTokens } from '../tokens/radii';

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
  const { colors, mode } = useThemeTokens();

  const handlePress = (item: SidebarItem) => {
    onItemPress?.(item);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(item.route as any);
  };

  return (
    <Box
      style={{
        ...styles.container,
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
          <SidebarItem
            key={item.id}
            item={item}
            isActive={pathname === item.route || pathname.startsWith(item.route + '/')}
            onPress={() => handlePress(item)}
          />
        ))}
      </Box>
    </Box>
  );
};

interface SidebarItemProps {
  item: SidebarItem;
  isActive: boolean;
  onPress: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, onPress }) => {
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
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IconSymbol
              name={item.icon as any}
              size={24}
              color={isActive ? colors.accent.primary : colors.foreground.secondary}
            />
            <Text
              variant="body"
              weight={isActive ? 'semibold' : 'normal'}
              style={{
                color: isActive ? colors.accent.primary : colors.foreground.secondary,
                marginLeft: spacingTokens[3],
              }}
            >
              {item.title}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    borderRightWidth: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: spacingTokens[4],
  },
  nav: {
    flex: 1,
    paddingTop: spacingTokens[2],
    paddingHorizontal: spacingTokens[2],
  },
  item: {
    marginBottom: spacingTokens[1],
    borderRadius: radiusTokens.lg,
    overflow: 'hidden',
  },
  activeItem: {
    // Inset/pressed effect
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacingTokens[2],
    paddingHorizontal: spacingTokens[3],
  },
});
