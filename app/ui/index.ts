/**
 * ============================================================================
 * CHESSMATE DESIGN LANGUAGE SYSTEM – COMPLETE IMPLEMENTATION
 * ============================================================================
 * 
 * Primary export file for the entire design system.
 * All components, tokens, and theme utilities are exported here.
 * 
 * USAGE:
 *   import { Box, Button, MatchCard, ThemeProvider, useThemeTokens } from '@/ui'
 * 
 * ============================================================================
 */

// Re-export all tokens
export { colorTokens, semanticColors, getColor } from './tokens/colors';
export { typographyTokens, textVariants } from './tokens/typography';
export { spacingTokens, spacingScale } from './tokens/spacing';
export { radiusTokens, radiusScale } from './tokens/radii';
export { shadowTokens } from './tokens/shadows';
export { motionTokens, microInteractions } from './tokens/motion';

// Re-export all primitive components
export { Box } from './primitives/Box';
export { Text } from './primitives/Text';
export { Button } from './primitives/Button';
export { Card } from './primitives/Card';
export { Panel } from './primitives/Panel';
export { Input } from './primitives/Input';
export { Tag } from './primitives/Tag';
export { Avatar } from './primitives/Avatar';
export { Divider } from './primitives/Divider';
export { Surface } from './primitives/Surface';

// Re-export stack components
export { VStack, HStack, Spacer } from './primitives/Stack';

// Re-export form components
export { Checkbox } from './primitives/Checkbox';
export { Radio } from './primitives/Radio';
export { Select } from './primitives/Select';

// Re-export feedback components
export { Toast } from './primitives/Toast';
export type { ToastType, ToastProps } from './primitives/Toast';

// Re-export chess-specific components
export { MatchCard } from './components/MatchCard';
export { ScoreInput } from './components/ScoreInput';
export { PlayerRow } from './components/PlayerRow';
export { TournamentHeader } from './components/TournamentHeader';
export { RoundSelector } from './components/RoundSelector';
export { ActionBar } from './components/ActionBar';

// Re-export theme system
export { ThemeProvider as DLSThemeProvider } from './theme/ThemeProvider';
export { ThemeProvider } from './theme/ThemeContext';
export { useThemeTokens, useColors, useIsDark, ThemeContext } from './hooks/useThemeTokens';

// Re-export animation utilities
export { animations } from './utilities/animations';
export type { AnimationOptions } from './utilities/animations';

export type { ThemeMode, ThemeContextType } from './hooks/useThemeTokens';

