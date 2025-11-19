/**
 * BottomNav Component
 * app/ui/navigation/BottomNav.tsx
 * 
 * Fixed tab bar navigation with icons and active states
 */

import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Box } from '../primitives/Box';
import { HStack, VStack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { useThemeTokens } from '../hooks/useThemeTokens';
import { spacingTokens } from '../tokens/spacing';

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, activeId }) => {
  const { colors } = useThemeTokens();

  return (
    <Box
      style={{
        position: Platform.OS === 'web' ? 'fixed' : 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: colors.background.tertiary,
        paddingVertical: spacingTokens[2],
        paddingBottom: Platform.OS === 'ios' ? spacingTokens[4] : spacingTokens[2],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <HStack justifyContent="space-around" alignItems="center">
        {items.map((item) => {

          const isActive = item.id === activeId;
          
          return (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              style={{
                alignItems: 'center',
                paddingVertical: spacingTokens[2],
                paddingHorizontal: spacingTokens[3],
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <VStack gap={4} alignItems="center">
                <Text style={{ fontSize: 24 }}>
                  {item.icon}
                </Text>
                <Text 
                  variant="caption" 
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? colors.accent.primary : colors.foreground.muted}
                  style={{ fontSize: 12 }}
                >
                  {item.label}
                </Text>
              </VStack>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
};

BottomNav.displayName = 'BottomNav';
