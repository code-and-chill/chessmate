/**
 * Accessibility Configuration
 * Provides theme variants and piece set options for better accessibility
 */

export type ContrastLevel = 'standard' | 'high' | 'maximum';
export type PieceSet = 'classic' | 'modern' | 'colorblind' | 'large';

/**
 * High contrast color themes for better visibility
 */
export const HighContrastThemes = {
  standard: {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#0066cc',
      secondary: '#666666',
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      primary: '#4d9fff',
      secondary: '#999999',
    },
  },
  high: {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#0052a3',
      secondary: '#333333',
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      primary: '#66b3ff',
      secondary: '#cccccc',
    },
  },
  maximum: {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#003d7a',
      secondary: '#000000',
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      primary: '#99ccff',
      secondary: '#ffffff',
    },
  },
} as const;

/**
 * Piece set configurations for different accessibility needs
 */
export const PieceSetConfig = {
  classic: {
    name: 'Classic',
    description: 'Traditional chess piece symbols',
    scale: 1.0,
  },
  modern: {
    name: 'Modern',
    description: 'Clean, modern piece design',
    scale: 1.0,
  },
  colorblind: {
    name: 'Colorblind Friendly',
    description: 'Enhanced contrast and patterns',
    scale: 1.0,
    usePatterns: true, // Add patterns to distinguish colors
  },
  large: {
    name: 'Large',
    description: 'Larger pieces for better visibility',
    scale: 1.2,
  },
} as const;

/**
 * Board theme colors optimized for accessibility
 */
export const AccessibleBoardThemes = {
  green: {
    light: '#EEEED2',
    dark: '#769656',
    highlight: '#BACA44',
    selected: '#F6F669',
  },
  blue: {
    light: '#DEE3E6',
    dark: '#8CA2AD',
    highlight: '#97B8C4',
    selected: '#A7C7D8',
  },
  brown: {
    light: '#F0D9B5',
    dark: '#B58863',
    highlight: '#CDD26A',
    selected: '#E8E18E',
  },
  highContrast: {
    light: '#FFFFFF',
    dark: '#000000',
    highlight: '#FFFF00',
    selected: '#FFD700',
  },
  colorblind: {
    light: '#F5DEB3', // Wheat
    dark: '#8B4513', // Saddle brown
    highlight: '#FF4500', // Orange red
    selected: '#00CED1', // Dark turquoise
  },
} as const;

/**
 * Keyboard navigation shortcuts
 */
export const KeyboardShortcuts = {
  navigation: {
    arrowKeys: 'Navigate board squares',
    tab: 'Focus next interactive element',
    shiftTab: 'Focus previous interactive element',
    escape: 'Cancel selection',
  },
  actions: {
    enter: 'Confirm move',
    space: 'Select/deselect piece',
    r: 'Resign game',
    d: 'Offer/accept draw',
    f: 'Toggle fullscreen',
  },
  accessibility: {
    'alt+h': 'Toggle high contrast',
    'alt+p': 'Cycle piece sets',
    'alt+b': 'Toggle board theme',
    'alt+m': 'Toggle move announcements',
  },
} as const;

/**
 * Screen reader announcements for chess moves
 */
export const getScreenReaderAnnouncement = (
  piece: string,
  from: string,
  to: string,
  capture: boolean = false,
  check: boolean = false,
  checkmate: boolean = false
): string => {
  const pieceNames: Record<string, string> = {
    K: 'King',
    Q: 'Queen',
    R: 'Rook',
    B: 'Bishop',
    N: 'Knight',
    P: 'Pawn',
  };

  const pieceName = pieceNames[piece] || piece;
  let announcement = `${pieceName} from ${from} to ${to}`;

  if (capture) {
    announcement += ', captures';
  }

  if (checkmate) {
    announcement += ', checkmate';
  } else if (check) {
    announcement += ', check';
  }

  return announcement;
};

/**
 * Focus management utilities
 */
export const FocusUtils = {
  /**
   * Trap focus within a modal or dialog
   */
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  },

  /**
   * Announce to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof document !== 'undefined') {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'alert');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only'; // Visually hidden
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  },
};

/**
 * Reduced motion preferences
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

/**
 * ARIA labels for chess board
 */
export const getSquareAriaLabel = (file: number, rank: number, piece?: string): string => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const square = `${files[file]}${rank + 1}`;
  
  if (piece) {
    const color = piece === piece.toUpperCase() ? 'White' : 'Black';
    const pieceType = piece.toUpperCase();
    const pieceNames: Record<string, string> = {
      K: 'King',
      Q: 'Queen',
      R: 'Rook',
      B: 'Bishop',
      N: 'Knight',
      P: 'Pawn',
    };
    return `${square}, ${color} ${pieceNames[pieceType] || pieceType}`;
  }
  
  return `${square}, empty`;
};
