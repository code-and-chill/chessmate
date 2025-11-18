import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { useTheme } from '../ui/theme/ThemeContext';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { GameBoardSection } from '../components/play/GameBoardSection';
import { PlayerPanel } from '../components/compound/PlayerPanel';
import { GameActions } from '../components/compound/GameActions';
import { MoveList } from '../components/compound/MoveList';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../hooks/useAuth';
import { useGameParticipant } from '../hooks/useGameParticipant';
import { useGameInteractivity } from '../hooks/useGameInteractivity';
import { spacing } from '../ui/tokens';
import {
  PlayScreenConfig,
  defaultPlayScreenConfig,
} from '../ui/config';

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
          myColor={participant.myColor}
          opponentColor={participant.opponentColor}
          isInteractive={interactivity.canMove}
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
