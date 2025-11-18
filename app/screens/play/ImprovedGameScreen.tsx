import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ResponsiveGameLayout } from '@/components/layouts/ResponsiveGameLayout';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';
import { QuickStartModal, type TimeControl } from '@/components/modals/QuickStartModal';
import { LoadingOverlay, FeedbackToast } from '@/components/ui/Button';
import { shouldShowSidebar } from '@/constants/layout';
import { useGame } from '@/hooks/useGame';

interface ImprovedGameScreenProps {
  gameId: string;
  currentRoute?: string;
}

/**
 * ImprovedGameScreen Component
 * 
 * Complete redesigned game screen with:
 * - Responsive board layout (centered, 480-600px on desktop)
 * - Sidebar navigation (desktop only)
 * - Player panels above/below board
 * - Move list on right (desktop) or below (mobile)
 * - Quick start modal for new games
 * - Consistent UI feedback and loading states
 */
export const ImprovedGameScreen: React.FC<ImprovedGameScreenProps> = ({
  gameId,
  currentRoute = '/',
}) => {
  const { data: game, isLoading, error } = useGame(gameId);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showSidebar = shouldShowSidebar();

  const handleStartGame = async (timeControl: TimeControl) => {
    try {
      // TODO: Implement game creation API call
      console.log('Starting game with time control:', timeControl);
      setShowQuickStart(false);
      setFeedbackToast({
        visible: true,
        message: 'Game created successfully!',
        type: 'success',
      });
    } catch (err) {
      setFeedbackToast({
        visible: true,
        message: 'Failed to create game',
        type: 'error',
      });
    }
  };

  const handleJoinGame = async (joinGameId: string) => {
    try {
      // TODO: Implement join game API call
      console.log('Joining game:', joinGameId);
      setShowQuickStart(false);
      setFeedbackToast({
        visible: true,
        message: 'Joined game successfully!',
        type: 'success',
      });
    } catch (err) {
      setFeedbackToast({
        visible: true,
        message: 'Failed to join game',
        type: 'error',
      });
    }
  };

  const handleMove = async (from: string, to: string) => {
    try {
      // TODO: Implement move API call
      console.log('Move:', from, 'to', to);
    } catch (err) {
      setFeedbackToast({
        visible: true,
        message: 'Invalid move',
        type: 'error',
      });
    }
  };

  const handleResign = async () => {
    try {
      // TODO: Implement resign API call
      console.log('Resigning game');
      setFeedbackToast({
        visible: true,
        message: 'Game resigned',
        type: 'info',
      });
    } catch (err) {
      setFeedbackToast({
        visible: true,
        message: 'Failed to resign',
        type: 'error',
      });
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FeedbackToast
          visible={true}
          message="Error loading game"
          type="error"
          onDismiss={() => {}}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar Navigation (Desktop Only) */}
      {showSidebar && <NavigationSidebar currentRoute={currentRoute} />}

      {/* Main Game Area */}
      <View style={styles.mainContent}>
        {game && (
          <ResponsiveGameLayout
            boardProps={{
              fen: game.fen,
              sideToMove: game.sideToMove,
              myColor: game.myColor,
              onMove: handleMove,
              isInteractive: game.status === 'in_progress',
            }}
            topPlayerProps={{
              color: game.opponentColor,
              isSelf: false,
              remainingMs: game.opponentTimeMs || 0,
              accountId: game.opponentId || 'Unknown',
              isActive: game.sideToMove === game.opponentColor,
            }}
            bottomPlayerProps={{
              color: game.myColor,
              isSelf: true,
              remainingMs: game.myTimeMs || 0,
              accountId: game.myAccountId || 'You',
              isActive: game.sideToMove === game.myColor,
            }}
            moves={game.moves || []}
            gameActionsProps={{
              status: game.status,
              result: game.result,
              endReason: game.endReason,
              onResign: handleResign,
            }}
          />
        )}

        {/* Loading State */}
        <LoadingOverlay visible={isLoading} message="Loading game..." />
      </View>

      {/* Quick Start Modal */}
      <QuickStartModal
        visible={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onStartGame={handleStartGame}
        onJoinGame={handleJoinGame}
      />

      {/* Feedback Toast */}
      <FeedbackToast
        {...feedbackToast}
        onDismiss={() => setFeedbackToast({ ...feedbackToast, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    }),
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
