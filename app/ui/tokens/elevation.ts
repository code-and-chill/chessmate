/**
 * ELEVATION TOKEN SYSTEM
 * 
 * Z-index layering system for spatial hierarchy and depth perception.
 * Based on Material Design elevation principles adapted for ChessMate's AI-aesthetic.
 * 
 * Elevation levels create visual hierarchy through:
 * - Z-index positioning
 * - Shadow depth
 * - Backdrop blur intensity
 * 
 * Usage:
 * - Surface 0-4: Content layers (cards, panels)
 * - Surface 8-12: Interactive elements (buttons, floating actions)
 * - Surface 16-20: Overlays (modals, drawers)
 * - Surface 24: Maximum elevation (tooltips, popovers)
 * 
 * @packageDocumentation
 */

/**
 * Elevation scale with z-index and shadow mappings
 */
export const elevationTokens = {
  surface0: {
    zIndex: 0,
    shadow: 'none',
    description: 'Base surface - flat on background',
  },
  surface1: {
    zIndex: 1,
    shadow: 'xs',
    description: 'Slightly raised - subtle cards',
  },
  surface2: {
    zIndex: 2,
    shadow: 'sm',
    description: 'Raised - standard cards',
  },
  surface4: {
    zIndex: 4,
    shadow: 'md',
    description: 'Elevated - prominent cards, panels',
  },
  surface6: {
    zIndex: 6,
    shadow: 'card',
    description: 'Floating - interactive cards',
  },
  surface8: {
    zIndex: 8,
    shadow: 'lg',
    description: 'Floating high - buttons, FABs',
  },
  surface12: {
    zIndex: 12,
    shadow: 'panel',
    description: 'Hovering - sticky headers, app bars',
  },
  surface16: {
    zIndex: 16,
    shadow: 'floating',
    description: 'Overlay - modals, bottom sheets',
  },
  surface20: {
    zIndex: 20,
    shadow: 'modal',
    description: 'High overlay - dialogs, alerts',
  },
  surface24: {
    zIndex: 24,
    shadow: 'floating',
    description: 'Maximum elevation - tooltips, popovers',
  },
} as const;

/**
 * Elevation level type
 */
export type ElevationLevel = keyof typeof elevationTokens;

/**
 * Get elevation properties for a given level
 */
export const getElevation = (level: ElevationLevel) => {
  return elevationTokens[level];
};

/**
 * Component elevation mapping
 * Maps component types to their appropriate elevation levels
 */
export const componentElevation = {
  // Content layers
  card: 'surface2' as ElevationLevel,
  cardElevated: 'surface4' as ElevationLevel,
  cardFloating: 'surface6' as ElevationLevel,
  panel: 'surface2' as ElevationLevel,
  panelElevated: 'surface4' as ElevationLevel,

  // Interactive elements
  button: 'surface1' as ElevationLevel,
  buttonFloating: 'surface8' as ElevationLevel,
  fab: 'surface8' as ElevationLevel,
  chip: 'surface1' as ElevationLevel,

  // Navigation
  header: 'surface4' as ElevationLevel,
  headerSticky: 'surface12' as ElevationLevel,
  bottomNav: 'surface8' as ElevationLevel,
  sidebar: 'surface4' as ElevationLevel,

  // Overlays
  modal: 'surface16' as ElevationLevel,
  modalLarge: 'surface20' as ElevationLevel,
  dialog: 'surface20' as ElevationLevel,
  drawer: 'surface16' as ElevationLevel,
  bottomSheet: 'surface16' as ElevationLevel,

  // Feedback
  tooltip: 'surface24' as ElevationLevel,
  popover: 'surface24' as ElevationLevel,
  dropdown: 'surface12' as ElevationLevel,
  toast: 'surface20' as ElevationLevel,

  // Chess-specific
  chessBoard: 'surface2' as ElevationLevel,
  evalBar: 'surface1' as ElevationLevel,
  moveList: 'surface2' as ElevationLevel,
  gameInfo: 'surface4' as ElevationLevel,
  analysisPanel: 'surface4' as ElevationLevel,
  coachTooltip: 'surface24' as ElevationLevel,
} as const;

/**
 * Backdrop blur intensity by elevation level
 * Used for glassmorphic effects - higher elevation = stronger blur
 */
export const elevationBlur = {
  surface0: 0,
  surface1: 10,
  surface2: 20,
  surface4: 30,
  surface6: 40,
  surface8: 50,
  surface12: 60,
  surface16: 70,
  surface20: 80,
  surface24: 90,
} as const;

/**
 * Get backdrop blur intensity for elevation level
 */
export const getElevationBlur = (level: ElevationLevel): number => {
  return elevationBlur[level];
};

/**
 * Elevation transition durations
 * For smooth elevation changes (e.g., hover states)
 */
export const elevationTransition = {
  instant: 100,
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

/**
 * Get elevation transition duration
 */
export const getElevationTransition = (
  speed: keyof typeof elevationTransition = 'normal'
): number => {
  return elevationTransition[speed];
};
