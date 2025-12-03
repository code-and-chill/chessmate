/**
 * FEEDBACK COLOR TOKENS
 * 
 * Chess-specific semantic colors for move quality, game analysis, and coach feedback.
 * These colors provide emotional context and instant recognition of move classifications.
 * 
 * Color Psychology:
 * - Brilliant: Teal/cyan (innovative, creative, exceptional)
 * - Great/Best: Green (positive, correct, optimal)
 * - Good/Book: Light green (acceptable, standard)
 * - Inaccuracy: Yellow (caution, minor issue)
 * - Mistake: Orange (warning, attention needed)
 * - Blunder: Red (error, critical issue)
 * - Miss: Gray (neutral, opportunity not taken)
 * 
 * @packageDocumentation
 */

import type { ColorToken } from './colors';

/**
 * Move quality classification colors
 * 
 * Based on centipawn loss thresholds:
 * - Brilliant: Best move with brilliant tactical/strategic merit
 * - Best: Objectively strongest move (0 centipawn loss)
 * - Great: Excellent move (0-25 centipawns loss)
 * - Good: Solid move (25-50 centipawns loss)
 * - Book: Opening book move (theoretical move)
 * - Inaccuracy: Suboptimal move (50-100 centipawns loss)
 * - Mistake: Significant error (100-300 centipawns loss)
 * - Blunder: Critical error (300+ centipawns loss)
 * - Miss: Missed winning opportunity
 */
export const feedbackColorTokens = {
  moveQuality: {
    brilliant: {
      primary: { light: '#06B6D4', dark: '#22D3EE' }, // Cyan 500/400
      secondary: { light: '#0891B2', dark: '#67E8F9' }, // Cyan 600/300
      background: { light: 'rgba(6, 182, 212, 0.1)', dark: 'rgba(34, 211, 238, 0.15)' },
      border: { light: 'rgba(6, 182, 212, 0.3)', dark: 'rgba(34, 211, 238, 0.3)' },
    },
    best: {
      primary: { light: '#16A34A', dark: '#22C55E' }, // Green 600/500
      secondary: { light: '#15803D', dark: '#4ADE80' }, // Green 700/400
      background: { light: 'rgba(22, 163, 74, 0.1)', dark: 'rgba(34, 197, 94, 0.15)' },
      border: { light: 'rgba(22, 163, 74, 0.3)', dark: 'rgba(34, 197, 94, 0.3)' },
    },
    great: {
      primary: { light: '#16A34A', dark: '#22C55E' }, // Green 600/500 (same as best)
      secondary: { light: '#15803D', dark: '#4ADE80' }, // Green 700/400
      background: { light: 'rgba(22, 163, 74, 0.1)', dark: 'rgba(34, 197, 94, 0.15)' },
      border: { light: 'rgba(22, 163, 74, 0.3)', dark: 'rgba(34, 197, 94, 0.3)' },
    },
    good: {
      primary: { light: '#65A30D', dark: '#84CC16' }, // Lime 600/500
      secondary: { light: '#4D7C0F', dark: '#A3E635' }, // Lime 700/400
      background: { light: 'rgba(101, 163, 13, 0.1)', dark: 'rgba(132, 204, 22, 0.15)' },
      border: { light: 'rgba(101, 163, 13, 0.3)', dark: 'rgba(132, 204, 22, 0.3)' },
    },
    book: {
      primary: { light: '#7C3AED', dark: '#A78BFA' }, // Purple 600/400
      secondary: { light: '#6D28D9', dark: '#C4B5FD' }, // Purple 700/300
      background: { light: 'rgba(124, 58, 237, 0.1)', dark: 'rgba(167, 139, 250, 0.15)' },
      border: { light: 'rgba(124, 58, 237, 0.3)', dark: 'rgba(167, 139, 250, 0.3)' },
    },
    inaccuracy: {
      primary: { light: '#EAB308', dark: '#FACC15' }, // Yellow 500/400
      secondary: { light: '#CA8A04', dark: '#FDE047' }, // Yellow 600/300
      background: { light: 'rgba(234, 179, 8, 0.1)', dark: 'rgba(250, 204, 21, 0.15)' },
      border: { light: 'rgba(234, 179, 8, 0.3)', dark: 'rgba(250, 204, 21, 0.3)' },
    },
    mistake: {
      primary: { light: '#F97316', dark: '#FB923C' }, // Orange 500/400
      secondary: { light: '#EA580C', dark: '#FDBA74' }, // Orange 600/300
      background: { light: 'rgba(249, 115, 22, 0.1)', dark: 'rgba(251, 146, 60, 0.15)' },
      border: { light: 'rgba(249, 115, 22, 0.3)', dark: 'rgba(251, 146, 60, 0.3)' },
    },
    blunder: {
      primary: { light: '#DC2626', dark: '#EF4444' }, // Red 600/500
      secondary: { light: '#B91C1C', dark: '#F87171' }, // Red 700/400
      background: { light: 'rgba(220, 38, 38, 0.1)', dark: 'rgba(239, 68, 68, 0.15)' },
      border: { light: 'rgba(220, 38, 38, 0.3)', dark: 'rgba(239, 68, 68, 0.3)' },
    },
    miss: {
      primary: { light: '#64748B', dark: '#94A3B8' }, // Slate 500/400
      secondary: { light: '#475569', dark: '#CBD5E1' }, // Slate 600/300
      background: { light: 'rgba(100, 116, 139, 0.1)', dark: 'rgba(148, 163, 184, 0.15)' },
      border: { light: 'rgba(100, 116, 139, 0.3)', dark: 'rgba(148, 163, 184, 0.3)' },
    },
  },

  /**
   * Accuracy level colors
   * Based on accuracy percentage thresholds
   */
  accuracy: {
    excellent: { light: '#16A34A', dark: '#22C55E' }, // 95%+ (Green)
    great: { light: '#65A30D', dark: '#84CC16' }, // 90-94% (Lime)
    good: { light: '#EAB308', dark: '#FACC15' }, // 80-89% (Yellow)
    average: { light: '#F97316', dark: '#FB923C' }, // 70-79% (Orange)
    poor: { light: '#DC2626', dark: '#EF4444' }, // <70% (Red)
  },

  /**
   * Game phase colors
   */
  gamePhase: {
    opening: { light: '#3B82F6', dark: '#60A5FA' }, // Blue 500/400
    middlegame: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple 500/400
    endgame: { light: '#EC4899', dark: '#F472B6' }, // Pink 500/400
  },

  /**
   * Coach feedback sentiment colors
   */
  coach: {
    positive: { light: '#16A34A', dark: '#22C55E' }, // Encouraging (Green)
    neutral: { light: '#3B82F6', dark: '#60A5FA' }, // Informative (Blue)
    cautionary: { light: '#F59E0B', dark: '#FBBF24' }, // Warning (Amber)
    critical: { light: '#DC2626', dark: '#EF4444' }, // Critical (Red)
  },

  /**
   * Evaluation bar gradient colors
   */
  evaluation: {
    winning: { light: '#16A34A', dark: '#22C55E' }, // +3.0+ (Green)
    advantage: { light: '#84CC16', dark: '#A3E635' }, // +1.0 to +3.0 (Lime)
    slight: { light: '#F3F4F6', dark: '#374151' }, // -1.0 to +1.0 (Gray)
    disadvantage: { light: '#94A3B8', dark: '#64748B' }, // -1.0 to -3.0 (Slate)
    losing: { light: '#1F2937', dark: '#111827' }, // -3.0- (Dark gray)
  },
};

/**
 * Get move quality color based on classification
 */
export const getMoveQualityColor = (
  quality: 'brilliant' | 'best' | 'great' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder' | 'miss',
  variant: 'primary' | 'secondary' | 'background' | 'border',
  isDark: boolean
): string => {
  const colorToken = feedbackColorTokens.moveQuality[quality][variant];
  if (typeof colorToken === 'string') return colorToken;
  return isDark ? colorToken.dark : colorToken.light;
};

/**
 * Get accuracy color based on percentage
 */
export const getAccuracyColor = (accuracy: number, isDark: boolean): string => {
  let level: keyof typeof feedbackColorTokens.accuracy;
  if (accuracy >= 95) level = 'excellent';
  else if (accuracy >= 90) level = 'great';
  else if (accuracy >= 80) level = 'good';
  else if (accuracy >= 70) level = 'average';
  else level = 'poor';

  const colorToken = feedbackColorTokens.accuracy[level];
  return isDark ? colorToken.dark : colorToken.light;
};

/**
 * Get game phase color
 */
export const getGamePhaseColor = (
  phase: 'opening' | 'middlegame' | 'endgame',
  isDark: boolean
): string => {
  const colorToken = feedbackColorTokens.gamePhase[phase];
  return isDark ? colorToken.dark : colorToken.light;
};

/**
 * Get coach feedback color based on sentiment
 */
export const getCoachFeedbackColor = (
  sentiment: 'positive' | 'neutral' | 'cautionary' | 'critical',
  isDark: boolean
): string => {
  const colorToken = feedbackColorTokens.coach[sentiment];
  return isDark ? colorToken.dark : colorToken.light;
};

/**
 * Get evaluation bar color based on centipawn value
 */
export const getEvaluationColor = (centipawns: number, isDark: boolean): string => {
  let level: keyof typeof feedbackColorTokens.evaluation;
  if (centipawns >= 300) level = 'winning';
  else if (centipawns >= 100) level = 'advantage';
  else if (centipawns >= -100) level = 'slight';
  else if (centipawns >= -300) level = 'disadvantage';
  else level = 'losing';

  const colorToken = feedbackColorTokens.evaluation[level];
  return isDark ? colorToken.dark : colorToken.light;
};

/**
 * Move quality symbol map
 */
export const moveQualitySymbols = {
  brilliant: '‼',
  best: '✓',
  great: '✓',
  good: '✓',
  book: '📖',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  miss: '?!',
} as const;

/**
 * Move quality labels
 */
export const moveQualityLabels = {
  brilliant: 'Brilliant',
  best: 'Best',
  great: 'Great',
  good: 'Good',
  book: 'Book',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
  miss: 'Missed Win',
} as const;
