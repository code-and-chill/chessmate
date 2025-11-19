import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from '@/ui/primitives/Box';
import { VStack, HStack } from '@/ui/primitives/Stack';
import { Surface } from '@/ui/primitives/Surface';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { shadowTokens } from '@/ui/tokens/shadows';

// ==================== HEADER ZONE ====================

interface GameHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ children, style }) => {
  const { colors } = useThemeTokens();
  
  return (
    <Box
      style={{
        backgroundColor: colors.background.secondary,
        paddingHorizontal: spacingTokens[4],
        paddingVertical: spacingTokens[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.background.tertiary,
        ...shadowTokens.card,
        ...(style as ViewStyle),
      }}
    >
      {children}
    </Box>
  );
};

GameHeader.displayName = 'GameHeader';

// ==================== BOARD ZONE ====================

interface BoardZoneProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const BoardZone: React.FC<BoardZoneProps> = ({ children, style }) => {
  const { colors } = useThemeTokens();
  
  return (
    <Box
      style={{
        alignItems: 'center',
        width: '100%',
        ...(style as ViewStyle),
      }}
    >
      <Surface
        variant="default"
        style={{
          borderRadius: spacingTokens[3],
          overflow: 'hidden',
          backgroundColor: colors.background.primary,
          ...shadowTokens.floating,
        }}
      >
        {children}
      </Surface>
    </Box>
  );
};

BoardZone.displayName = 'BoardZone';

// ==================== ACTIONS ZONE ====================

interface ActionsZoneProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ActionsZone: React.FC<ActionsZoneProps> = ({ children, style }) => {
  const { colors } = useThemeTokens();
  
  return (
    <Surface
      variant="default"
      style={{
        borderRadius: spacingTokens[3],
        padding: spacingTokens[4],
        backgroundColor: colors.background.secondary,
        ...(style as ViewStyle),
      }}
    >
      {children}
    </Surface>
  );
};

ActionsZone.displayName = 'ActionsZone';

// ==================== UTILITY ZONE ====================

interface UtilityZoneProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}

export const UtilityZone: React.FC<UtilityZoneProps> = ({ children, style }) => {
  const { colors } = useThemeTokens();
  
  return (
    <Surface
      variant="default"
      style={{
        borderRadius: spacingTokens[3],
        padding: spacingTokens[4],
        backgroundColor: colors.background.secondary,
        minHeight: 400,
        ...shadowTokens.card,
        ...(style as ViewStyle),
      }}
    >
      {children}
    </Surface>
  );
};

UtilityZone.displayName = 'UtilityZone';

// ==================== CORE ZONE (Container for Player + Board + Player + Actions) ====================

interface CoreZoneProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CoreZone: React.FC<CoreZoneProps> = ({ children, style }) => {
  return (
    <VStack
      gap={spacingTokens[3]}
      style={{
        width: '100%',
        alignItems: 'center',
        ...(style as ViewStyle),
      }}
    >
      {children}
    </VStack>
  );
};

CoreZone.displayName = 'CoreZone';

// ==================== FOOTER NAV ZONE ====================

interface FooterNavZoneProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FooterNavZone: React.FC<FooterNavZoneProps> = ({ children, style }) => {
  const { colors } = useThemeTokens();
  
  return (
    <Box
      style={{
        backgroundColor: colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: colors.background.tertiary,
        paddingVertical: spacingTokens[2],
        paddingHorizontal: spacingTokens[4],
        ...shadowTokens.panel,
        ...(style as ViewStyle),
      }}
    >
      <HStack justifyContent="space-around" alignItems="center">
        {children}
      </HStack>
    </Box>
  );
};

FooterNavZone.displayName = 'FooterNavZone';
