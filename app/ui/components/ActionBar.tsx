/**
 * ActionBar Component
 * app/ui/components/ActionBar.tsx
 */

import { Box } from '../primitives/Box';
import { Button } from '../primitives/Button';

type ActionBarProps = {
  actions: Array<{
    label: string;
    onPress: () => void;
    variant?: 'solid' | 'outline' | 'subtle' | 'ghost';
    icon?: React.ReactNode;
  }>;
};

export const ActionBar: React.FC<ActionBarProps> = ({ actions }) => {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-around"
      alignItems="center"
      padding={4}
      backgroundColor="#FAFAFA"
      borderWidth={1}
      borderColor="#E8E8E8"
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
