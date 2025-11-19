import type React from 'react';
import { Box } from '@/ui/primitives/Box';
import { spacingTokens } from '@/ui/tokens/spacing';

interface GameBoardContainerProps {
  children: React.ReactNode;
}

export function GameBoardContainer({ children }: GameBoardContainerProps): React.ReactElement {
  return (
    <Box 
      flex={1} 
      style={{ 
        paddingHorizontal: spacingTokens[4],
      }}
    >
      {children}
    </Box>
  );
}

// Keep the old export for backward compatibility during migration
export const PlayersSection = GameBoardContainer;
