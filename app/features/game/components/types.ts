/**
 * Game Components - Public API
 * app/features/game/components/index.ts
 */

// Legacy exports (maintain compatibility)
export { GameActions } from './GameActions';
export { GameResultModal } from './GameResultModal';
export { MoveList } from './MoveList';
export { PawnPromotionModal } from './PawnPromotionModal';
export { PlayerPanel } from './PlayerPanel';

// New enterprise-grade exports
export { PlayerCard } from './PlayerCard';
export type { PlayerCardProps, Color } from './PlayerCard';

// Zone layout components
export { 
  GameHeader,
  BoardZone,
  ActionsZone,
  UtilityZone,
  CoreZone,
  FooterNavZone,
} from './zones';

// Re-export types
export type { Move, PieceType } from './types';
