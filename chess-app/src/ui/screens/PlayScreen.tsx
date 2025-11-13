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
import { spacing } from '../tokens';

export interface PlayScreenProps {
  gameId: string;
}

export const PlayScreen = React.forwardRef<any, PlayScreenProps>(
  ({ gameId }, ref) => {
    const { t } = useI18n();
    const { colors } = useTheme();
    const { token, currentAccountId, isAuthenticated } = useAuth();
    const { game, loading, error, makeMove, resign } = useGame(
      gameId,
      token || '',
      'http://localhost:8001'
    );

    if (!isAuthenticated) {
      return (
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground">
          <Text variant="heading" color="primary">
            {t('errors.login_required')}
          </Text>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground">
          <ActivityIndicator size="large" color={colors.accentGreen} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground" padding="lg">
          <Text variant="heading" color="danger">
            Error loading game
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing.md }}>
            {error.message}
          </Text>
        </Box>
      );
    }

    if (!game || !currentAccountId) {
      return (
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground">
          <Text variant="heading" color="primary">
            Game not found
          </Text>
        </Box>
      );
    }

    const myColor =
      game.white.accountId === currentAccountId
        ? 'w'
        : game.black.accountId === currentAccountId
        ? 'b'
        : null;

    if (!myColor) {
      return (
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="appBackground">
          <Text variant="heading" color="danger">
            You are not a participant in this game
          </Text>
        </Box>
      );
    }

    const isInteractive = game.status === 'in_progress' && game.sideToMove === myColor;
    const opponentColor = myColor === 'w' ? 'b' : 'w';

    return (
      <Box
        ref={ref}
        flex={1}
        backgroundColor="appBackground"
        flexDirection="row"
        padding="lg"
        gap="lg"
      >
        <Box flex={1} flexDirection="column" gap="lg">
          <PlayerPanel
            position="top"
            color={opponentColor}
            isSelf={opponentColor === myColor}
            remainingMs={game[opponentColor === 'w' ? 'white' : 'black'].remainingMs}
            accountId={game[opponentColor === 'w' ? 'white' : 'black'].accountId}
          />

          <Box justifyContent="center" alignItems="center">
            <ChessBoard
              fen={game.fen}
              sideToMove={game.sideToMove}
              myColor={myColor}
              isInteractive={isInteractive}
              onMove={makeMove}
            />
          </Box>

          <PlayerPanel
            position="bottom"
            color={myColor}
            isSelf={true}
            remainingMs={game[myColor === 'w' ? 'white' : 'black'].remainingMs}
            accountId={game[myColor === 'w' ? 'white' : 'black'].accountId}
          />

          <GameActions
            status={game.status}
            result={game.result}
            endReason={game.endReason}
            onResign={resign}
          />
        </Box>

        <Box
          style={{
            width: 200,
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: spacing.md,
          }}
        >
          <Text variant="label" color="primary">
            Moves
          </Text>
          <MoveList moves={game.moves} />
        </Box>
      </Box>
    );
  }
);

PlayScreen.displayName = 'PlayScreen';
