/**
 * ActionBar Component
 * app/ui/components/ActionBar.tsx
 */

import { Box } from '../primitives/Box';
import { Button } from '../primitives/Button';
import { colorTokens, getColor } from '../tokens/colors';
import { useColors, useIsDark } from '../hooks/useThemeTokens';

type ActionBarProps = {
  actions: {
    label: string;
    onPress: () => void;
    variant?: 'solid' | 'outline' | 'subtle' | 'ghost';
    icon?: React.ReactNode;
  }[];
};

export const ActionBar: React.FC<ActionBarProps> = ({ actions }) => {
  const colors = useColors();
  const isDark = useIsDark();

  return (
    <Box
      flexDirection="row"
      justifyContent="space-around"
      alignItems="center"
      padding={4}
      backgroundColor={colors.background.secondary}
      borderWidth={1}
      borderColor={getColor(colorTokens.neutral[200], isDark)}
      gap={2}
      style={{ borderTopWidth: 1 }}
    >
      {actions.map((action) => (
        <Box key={action.label} flex={1}>
          <Button
            variant={action.variant || 'solid'}
            onPress={action.onPress}
            icon={action.icon}
          >
            {action.label}
          </Button>
        </Box>
      ))}
    </Box>
  );
};

ActionBar.displayName = 'ActionBar';
