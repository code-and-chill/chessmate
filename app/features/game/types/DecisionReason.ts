/**
 * DecisionReason - Why a game is rated or unrated
 */

export type DecisionReason =
  | 'MANUAL'
  | 'LOCAL_AUTO'
  | 'RATING_GAP_AUTO'
  | 'CUSTOM_POSITION_AUTO'
  | 'ODDS_AUTO';

export const DecisionReasonMessages: Record<DecisionReason, string> = {
  MANUAL: 'Player choice',
  LOCAL_AUTO: 'Local games are always unrated',
  RATING_GAP_AUTO: 'Rating difference too large (>500 points)',
  CUSTOM_POSITION_AUTO: 'Custom starting positions are unrated',
  ODDS_AUTO: 'Odds games are unrated',
};

export const DecisionReasonIcons: Record<DecisionReason, string> = {
  MANUAL: '👤',
  LOCAL_AUTO: '🏠',
  RATING_GAP_AUTO: '⚖️',
  CUSTOM_POSITION_AUTO: '♟️',
  ODDS_AUTO: '🎲',
};

export function getDecisionReasonMessage(reason: DecisionReason | null | undefined): string {
  if (!reason) return '';
  return DecisionReasonMessages[reason] || 'System decision';
}

export function getDecisionReasonIcon(reason: DecisionReason | null | undefined): string {
  if (!reason) return 'ℹ️';
  return DecisionReasonIcons[reason] || 'ℹ️';
}
