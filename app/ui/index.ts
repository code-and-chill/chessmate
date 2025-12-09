// Re-export all tokens
export { colorTokens, semanticColors, getColor } from './tokens/colors';
export { typographyTokens, textVariants } from './tokens/typography';
export { spacingTokens, spacingScale } from './tokens/spacing';
export { radiusTokens, radiusScale } from './tokens/radii';
export { shadowTokens } from './tokens/shadows';
export { motionTokens, microInteractions } from './tokens/motion';
export {
  feedbackColorTokens,
  getMoveQualityColor,
  getAccuracyColor,
  getGamePhaseColor,
  getCoachFeedbackColor,
  getEvaluationColor,
  moveQualitySymbols,
  moveQualityLabels,
} from './tokens/feedback';
export {
  elevationTokens,
  componentElevation,
  elevationBlur,
  elevationTransition,
  getElevation,
  getElevationBlur,
  getElevationTransition,
  type ElevationLevel,
} from './tokens/elevation';
export {
  materialTokens,
  svgPatterns,
  pieceShadow,
  squareGlow,
  boardBorder,
  getMaterial,
  getMaterialDataUri,
  getPieceShadow,
  getSquareGlow,
  getBoardBorder,
  type MaterialType,
  type PieceShadowLevel,
  type SquareGlowLevel,
  type BoardBorderStyle,
} from './tokens/materials';
export { boardThemes, defaultTheme, getBoardTheme, getAllThemes, getAllThemeIds, type BoardTheme, type BoardThemeId } from './tokens/board-themes';
export {
  breakpointValues,
  getCurrentBreakpoint,
  isBreakpoint,
  deviceType,
  responsive,
  gridColumns,
  getGridColumns,
  containerMaxWidth,
  getContainerMaxWidth,
  getSpacingMultiplier,
  type Breakpoint,
} from './tokens/breakpoints';

// Re-export layout tokens
export { layoutTokens, getSidebarWidthForBreakpoint } from './tokens/layout';

// Re-export all primitive components
export { Box } from './primitives/Box';
export { Text } from './primitives/Text';
export { Button } from './primitives/Button';
export { Card } from './primitives/Card';
export { Panel } from './primitives/Panel';
export { InteractivePressable } from './primitives/InteractivePressable';
export type { InteractivePressableProps } from './primitives/InteractivePressable';
export { Input } from './primitives/Input';
export { Tag } from './primitives/Tag';
export { Avatar } from './primitives/Avatar';
export { Divider } from './primitives/Divider';
export { Surface } from './primitives/Surface';
export { Badge } from './primitives/Badge';

// Re-export stack components
export { VStack, HStack, Spacer } from './primitives/Stack';

// Re-export form components
export { Checkbox } from './primitives/Checkbox';
export { Radio } from './primitives/Radio';
export { Select } from './primitives/Select';

// Re-export feedback components
export { Toast } from './primitives/Toast';
export type { ToastType, ToastProps } from './primitives/Toast';
export { LoadingOverlay } from './primitives/LoadingOverlay';
export type { LoadingOverlayProps } from './primitives/LoadingOverlay';

// Re-export new primitive components (DLS)
export { Modal } from './primitives/Modal';
export type { ModalProps, ModalSize, ModalPlacement } from './primitives/Modal';
export { List, ListItem, ListSection } from './primitives/List';
export type { ListItemProps, ListProps, ListSectionProps } from './primitives/List';
export { Container } from './primitives/Container';
export { Grid } from './primitives/Grid';

// Re-export component state system (DLS)
export {
  EmptyState,
  LoadingState,
  ErrorState,
  SkeletonLoader,
  ComponentStateManager,
} from './primitives/ComponentStates';
export type {
  ComponentState,
  EmptyStateProps,
  LoadingStateProps,
  ErrorStateProps,
  ComponentStateManagerProps,
} from './primitives/ComponentStates';

// Re-export chess-specific components
export { MatchCard } from './components/MatchCard';
export { ScoreInput } from './components/ScoreInput';
export { PlayerRow } from './components/PlayerRow';
export { TournamentHeader } from './components/TournamentHeader';
export { RoundSelector } from './components/RoundSelector';
export { ActionBar } from './components/ActionBar';
export { StatusBadge } from './components/StatusBadge';
export type { GameStatus } from './components/StatusBadge';

// Re-export new chess components (DLS)
export { GameCard } from './components/chess/GameCard';
export type { GameCardProps, Player, GameResult } from './components/chess/GameCard';
export { EvaluationBar } from './components/chess/EvaluationBar';
export type { EvaluationBarProps } from './components/chess/EvaluationBar';
export { MoveList } from './components/chess/MoveList';
export type { Move } from './components/chess/MoveList';
export { GameClock } from './components/chess/GameClock';
export { ResultDialog } from './components/chess/ResultDialog';
export type { GameResult as ResultType, ResultReason } from './components/chess/ResultDialog';
export { MoveQualityBadge, MoveQualityList, useMoveQualityCounts } from './components/chess/MoveQualityBadge';
export type { MoveQualityBadgeProps, MoveQualityListProps, MoveQuality, BadgeSize as MoveQualityBadgeSize, BadgeVariant as MoveQualityBadgeVariant } from './components/chess/MoveQualityBadge';
export { AccuracyGraph, useAccuracyCalculation } from './components/chess/AccuracyGraph';
export type { AccuracyGraphProps, AccuracyDataPoint } from './components/chess/AccuracyGraph';
export { EvalGraph, useCriticalMomentDetection } from './components/chess/EvalGraph';
export type { EvalGraphProps, EvalDataPoint, GamePhases } from './components/chess/EvalGraph';

// Re-export coach components
export { CoachTooltip, useCoachTooltip } from './components/coach/CoachTooltip';
export type { CoachTooltipProps, CoachSentiment, TooltipPosition, TooltipVariant } from './components/coach/CoachTooltip';
export { CoachAvatar, useExpressionCycle, useExpressionForSentiment, useExpressionForMoveQuality } from './components/coach/CoachAvatar';
export type { CoachAvatarProps, CoachExpression, AvatarSize } from './components/coach/CoachAvatar';

// Re-export new chess components (production enhancements)
export { EvalBar } from './components/chess/EvalBar';
export type { EvalBarProps } from './components/chess/EvalBar';
export { GameReviewPanel } from './components/chess/GameReviewPanel';
export type { GameReviewPanelProps, GraphType } from './components/chess/GameReviewPanel';

// Re-export theme system
export { ThemeProvider } from './theme/ThemeProvider';
export { ThemeContext } from './hooks/useThemeTokens';

// Re-export responsive hooks
export {
  useBreakpoint,
  useMediaQuery,
  useDeviceType,
  useResponsive,
  useGridColumns,
  useContainerMaxWidth,
  useSpacingMultiplier,
  useScreenDimensions,
} from './hooks/useResponsive';

// Re-export animation utilities
export { animations } from './utilities/animations';
export type { AnimationOptions } from './utilities/animations';

// Re-export animation presets
export {
  animationPresets,
  timingConfigs,
  springConfigs,
  entranceAnimations,
  exitAnimations,
  attentionAnimations,
  interactionAnimations,
  feedbackAnimations,
  chessAnimations,
  celebrationAnimations,
  getStaggerDelay,
  getSequenceDelay,
  loopConfig,
} from './animations/presets';

// Re-export layouts
export { ResponsiveGameLayout } from './layouts/ResponsiveGameLayout';
export type { ResponsiveGameLayoutProps } from './layouts/ResponsiveGameLayout';

// Re-export navigation
export { NavigationSidebar } from './navigation/NavigationSidebar';
export type { NavigationSidebarProps } from './navigation/NavigationSidebar';
export { BottomNav } from './navigation/BottomNav';
export type { NavItem } from './navigation/BottomNav';
export { Sidebar } from './components/Sidebar';
export type { SidebarProps, SidebarItem } from './components/Sidebar';

// Re-export modals
export { QuickStartModal } from './modals/QuickStartModal';
export type { QuickStartModalProps, TimeControl } from './modals/QuickStartModal';

// Re-export global primitives
export { GlobalContainer } from './primitives/GlobalContainer';

// Re-export IconSymbol
export { IconSymbol } from './primitives/icon-symbol';

// Re-export icon system
export { Icon, type IconName, type IconProps } from './icons';

// Re-export enhanced components
export { Skeleton, SkeletonCard, SkeletonList } from './primitives/SkeletonLoader';
export { FeatureScreenLayout } from './components/FeatureScreenLayout';
export { FeatureCard } from './components/FeatureCard';
export { StatCard } from './components/StatCard';
export { ChoiceChip } from './primitives/ChoiceChip';
export { Tabs } from './components/Tabs';
export type { TabItem } from './components/Tabs';
export { SegmentedControl } from './components/SegmentedControl';
export { RatedToggle } from './components/RatedToggle';

// Re-export style utilities
export { safeStyles, safeStyleArray } from './utilities/safeStyles';

export type { ThemeMode, ThemeContextType } from './hooks/useThemeTokens';
export { useThemeTokens, useColors, useIsDark, useTypography, useFonts } from './hooks/useThemeTokens';

// Add explicit re-export for GlobalLayout from the app package so imports like
// `import { GlobalLayout } from '@/ui'` resolve correctly to the actual component.
export { GlobalLayout } from '@/app/GlobalLayout';
