// Layout tokens - centralized sizes and layout-related constants
import { Breakpoint } from './breakpoints';
import { spacingScale } from './spacing';

export const layoutTokens = {
  sidebar: {
    // widths per breakpoint (reduced to give board more viewport on web)
    widths: {
      xs: 0,
      sm: 120,
      md: 140,
      lg: 160,
      xl: 200,
      xxl: 240,
    } as const,
    // sensible defaults
    desktopWidth: 160,
    mobileWidth: 240,
  },
  controls: {
    hamburgerSize: spacingScale.buttonHeight, // use token for consistent sizing
    hamburgerOffset: spacingScale.gutter, // use spacing token instead of magic number
  },
} as const;

export const getSidebarWidthForBreakpoint = (bp: Breakpoint): number => {
  return layoutTokens.sidebar.widths[bp] ?? layoutTokens.sidebar.desktopWidth;
};

export default layoutTokens;
