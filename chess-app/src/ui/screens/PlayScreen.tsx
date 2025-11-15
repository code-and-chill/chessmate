import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { ChessBoard } from '../components/compound/ChessBoard';
import { PlayerPanel } from '../components/compound/PlayerPanel';
import { GameActions } from '../components/compound/GameActions';
import { MoveList } from '../components/compound/MoveList';
import { useGame } from '../../core/hooks/useGame';
import { useAuth } from '../../core/hooks/useAuth';
import { useGameParticipant } from '../../core/hooks/useGameParticipant';
import { useGameInteractivity } from '../../core/hooks/useGameInteractivity';
import { spacing } from '../tokens';
import {
  PlayScreenConfig,
  defaultPlayScreenConfig,
} from '../config';

/**
 * PlayScreen Props
 * 
 * @property gameId - The ID of the game to display
 * @property config - Optional play screen configuration (board, theme, API settings)
 */
export interface PlayScreenProps {
  gameId: string;
  config?: Partial<PlayScreenConfig>;
}

/**
 * Error Screen Component
 * Renders error states with appropriate messaging
 */
const ErrorScreen: React.FC<{
  title: string;
  message?: string;
}> = ({ title, message }) => (
  <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground" padding="lg">
    <Text variant="heading" color="danger">
      {title}
    </Text>
    {message && (
      <Text variant="body" color="secondary" style={{ marginTop: spacing.md }}>
        {message}
      </Text>
    )}
  </Box>
);

/**
 * Loading Screen Component
 * Renders loading indicator
 */
const LoadingScreen: React.FC<{ accentColor: string }> = ({ accentColor }) => (
  <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground">
    <ActivityIndicator size="large" color={accentColor} />
  </Box>
);

/**
 * Game Board Section Component
 * Displays the interactive chess board with player panels and game actions
 */
const GameBoardSection: React.FC<{
  game: any;
  myColor: any;
  opponentColor: any;
  isInteractive: boolean;
  config: PlayScreenConfig;
  onMove: (from: string, to: string, promotion?: string) => Promise<void>;
  onResign: () => Promise<void>;
}> = ({
  game,
  myColor,
  opponentColor,
  isInteractive,
  config,
  onMove,
  onResign,
}) => (
  <Box flex={1} flexDirection="column" gap="lg">
    {/* Opponent Panel */}
    <PlayerPanel
      position="top"
      color={opponentColor as any}
      isSelf={false}
      remainingMs={game[opponentColor === 'w' ? 'white' : 'black'].remainingMs}
      accountId={game[opponentColor === 'w' ? 'white' : 'black'].accountId}
    />

    {/* Chess Board */}
    <Box justifyContent="center" alignItems="center">
      <ChessBoard
        fen={game.fen}
        sideToMove={game.sideToMove}
        myColor={myColor as any}
        isInteractive={isInteractive}
        onMove={onMove}
      />
    </Box>

    {/* Current Player Panel */}
    <PlayerPanel
      position="bottom"
      color={myColor as any}
      isSelf={true}
      remainingMs={game[myColor === 'w' ? 'white' : 'black'].remainingMs}
      accountId={game[myColor === 'w' ? 'white' : 'black'].accountId}
    />

    {/* Game Actions */}
    <GameActions
      status={game.status}
      result={game.result}
      endReason={game.endReason}
      onResign={onResign}
    />
  </Box>
);

/**
 * Move List Sidebar Component
 * Displays the game's move history
 */
const MoveListSidebar: React.FC<{
  moves: any[];
  width: number;
  colors: any;
}> = ({ moves, width, colors }) => (
  <Box
    style={{
      width,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
    }}
  >
    <Text variant="label" color="primary">
      Moves
    </Text>
    <MoveList moves={moves} />
  </Box>
);

/**
 * PlayScreen Component
 * 
 * Main component for displaying an active chess game.
 * 
 * Features:
 * - Configurable board appearance and behavior
 * - Configurable theme application
 * - Proper error and loading states
 * - Clear separation of concerns
 * - SOLID principles:
 *   - Single Responsibility: Component handles layout composition
 *   - Open/Closed: Config-based customization without modification
 *   - Liskov Substitution: Interchangeable component sections
 *   - Interface Segregation: Focused prop interfaces
 *   - Dependency Inversion: Depends on configs and hooks, not implementations
 * 
 * Extensibility:
 * - New board themes via config
 * - Custom board sizes via config
 * - API endpoints configurable
 * - Polling intervals configurable
 */
export const PlayScreen = React.forwardRef<any, PlayScreenProps>(
  ({ gameId, config }, ref) => {
    // Merge user config with defaults
    const screenConfig: PlayScreenConfig = {
      ...defaultPlayScreenConfig,
      ...config,
      board: {
        ...defaultPlayScreenConfig.board,
        ...config?.board,
      },
      theme: {
        ...defaultPlayScreenConfig.theme,
        ...config?.theme,
      },
    };

    // Core hooks
    const { t } = useI18n();
    const { colors } = useTheme();
    const { token, currentAccountId, isAuthenticated } = useAuth();

    // Game state
    const { game, loading, error, makeMove, resign } = useGame(
      gameId,
      token || '',
      screenConfig.apiBaseUrl,
      screenConfig.pollInterval
    );

    // Game participant determination
    const participant = useGameParticipant(game, currentAccountId || null);

    // Game interactivity determination
    const interactivity = useGameInteractivity(
      game,
      participant?.myColor || null
    );

    // ========== Render: Authentication Check ==========
    if (!isAuthenticated) {
      return <ErrorScreen title={t('errors.login_required')} />;
    }

    // ========== Render: Loading State ==========
    if (loading) {
      return <LoadingScreen accentColor={colors.accentGreen} />;
    }

    // ========== Render: Error State ==========
    if (error) {
      return (
        <ErrorScreen
          title="Error loading game"
          message={error.message}
        />
      );
    }

    // ========== Render: Game Not Found ==========
    if (!game || !currentAccountId) {
      return <ErrorScreen title="Game not found" />;
    }

    // ========== Render: Not a Participant ==========
    if (!participant) {
      return (
        <ErrorScreen title="You are not a participant in this game" />
      );
    }

    // ========== Render: Main Game Screen ==========
    const { myColor, opponentColor } = participant;

    return (
      <Box
        ref={ref}
        flex={1}
        backgroundColor="appBackground"
        flexDirection="row"
        padding="lg"
        gap="lg"
      >
        {/* Board Section */}
        <GameBoardSection
          game={game}
          myColor={myColor}
          opponentColor={opponentColor}
          isInteractive={interactivity.canMove}
          config={screenConfig}
          onMove={makeMove}
          onResign={resign}
        />

        {/* Move List Sidebar */}
        <MoveListSidebar
          moves={game.moves}
          width={screenConfig.moveListWidth}
          colors={colors}
        />
      </Box>
    );
  }
);

PlayScreen.displayName = 'PlayScreen';
