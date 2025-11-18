import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGame } from '../../hooks/useGame';
import { GameBoardSection } from '../../components/play/GameBoardSection';

interface BotGameScreenProps {
  gameId: string;
}

export const BotGameScreen: React.FC<BotGameScreenProps> = ({ gameId }) => {
  const { data: game, isLoading, error } = useGame(gameId);

  if (isLoading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  if (error || !game) {
    return <View style={styles.error}><Text>Error loading game.</Text></View>;
  }

  return (
    <GameBoardSection
      game={game}
      myColor={game.myColor}
      opponentColor={game.opponentColor}
      isInteractive={game.isInteractive}
      onMove={game.makeMove}
      onResign={game.resign}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});