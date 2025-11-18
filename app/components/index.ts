/**
 * UI Components Index
 * Central export point for all UI/UX improvement components
 */

// Layout Components
export { NavigationSidebar } from './navigation/NavigationSidebar';
export type { NavigationSidebarProps } from './navigation/NavigationSidebar';

export { ResponsiveGameLayout } from './layouts/ResponsiveGameLayout';
export type { ResponsiveGameLayoutProps } from './layouts/ResponsiveGameLayout';

// Modal Components
export { QuickStartModal } from './modals/QuickStartModal';
export type { QuickStartModalProps, TimeControl } from './modals/QuickStartModal';

// UI Components
export { Button, LoadingOverlay, FeedbackToast } from './ui/Button';
export type { ButtonProps, LoadingOverlayProps, FeedbackToastProps } from './ui/Button';

export { FormInput } from './ui/FormInput';
export type { FormInputProps } from './ui/FormInput';

// Existing Compound Components (re-exported for convenience)
export { ChessBoard } from './compound/ChessBoard';
export type { ChessBoardProps } from './compound/ChessBoard';

export { PlayerPanel } from './compound/PlayerPanel';
export type { PlayerPanelProps } from './compound/PlayerPanel';

export { MoveList } from './compound/MoveList';
export type { MoveListProps, Move } from './compound/MoveList';

export { GameActions } from './compound/GameActions';
export type { GameActionsProps, GameStatus } from './compound/GameActions';
