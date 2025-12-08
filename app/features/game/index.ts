// Components
export { PlayerPanel } from './components/PlayerPanel';
export { PlayerCard } from './components/PlayerCard';
export type { PlayerCardProps } from './components/PlayerCard';
export { HeaderCard } from './components/HeaderCard';
export { GameStatusCard } from './components/GameStatusCard';
export type { GameStatusCardProps } from './components/GameStatusCard';
export { GameInfo } from './components/GameInfo';
export type { GameInfoProps } from './components/GameInfo';
export { MoveList } from './components/MoveList';
export { GameActions } from './components/GameActions';
export { GameResultModal } from './components/GameResultModal';
export { PawnPromotionModal, type PieceType } from './components/PawnPromotionModal';
export { GameHeader as GameHeaderCard } from './components/GameHeader';
export type { GameHeaderProps } from './components/GameHeader';

// Zone Layout Components
export { 
  GameHeader,
  BoardZone,
  ActionsZone,
  UtilityZone,
  CoreZone,
  FooterNavZone,
} from './components/zones';

// Types
export type {
  Color,
  GameStatus,
  GameResult,
  Move,
  PlayerInfo,
  GameState,
} from './types/game.types';

// Component prop types (for advanced usage)
export type { PlayerPanelProps } from './components/PlayerPanel';
export type { MoveListProps } from './components/MoveList';
export type { GameActionsProps } from './components/GameActions';

