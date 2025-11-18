/**
 * Theme Context – Board Themes Integration
 * app/ui/theme/ThemeContext.tsx
 *
 * Wraps the DLS ThemeProvider to support board themes (green, brown, blue, etc.)
 * Used by legacy components that manage board appearance
 */

import type React from 'react';
import { ThemeProvider as DLSThemeProvider } from './ThemeProvider';
import type { ThemeMode } from '../hooks/useThemeTokens';

export type BoardTheme = 'green' | 'brown' | 'blue' | 'purple' | 'gray';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultBoardTheme?: BoardTheme;
};

/**
 * ThemeProvider – Combines DLS Theme with Board Theme Support
 * 
 * Props:
 * - defaultMode: 'light' | 'dark' | 'auto' (defaults to 'auto')
 * - defaultBoardTheme: board color theme for chess display (for future use)
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'auto',
}: ThemeProviderProps) => {
  // Store board theme in context if needed by legacy components
  // For now, just wrap with DLS ThemeProvider
  // Legacy board theme handling can be added via separate context if needed

  return (
    <DLSThemeProvider defaultMode={defaultMode}>
      {children}
    </DLSThemeProvider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

ThemeProvider.displayName = 'ThemeProvider';
