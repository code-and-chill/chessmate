import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { ChessBoard, GameActions, MoveList, PlayerPanel, type Move } from '@/components/compound';
import { createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig } from '@/components/config';
import { isCheckmate, isStalemate, type Board } from '@/utils/chessEngine';

/**
 * Helper function to apply a move to FEN string
 * Takes algebraic notation (e.g., "e2e4") and updates the board
 */
const applyMoveToFEN = (fen: string, moveAlgebraic: string): string => {
  const fromFile = moveAlgebraic.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const fromRank = parseInt(moveAlgebraic[1]) - 1; // 1=0, 2=1, ..., 8=7
  const toFile = moveAlgebraic.charCodeAt(2) - 97;
  const toRank = parseInt(moveAlgebraic[3]) - 1;

  // Parse FEN into board
  const fenParts = fen.split(' ');
  const fenBoard = fenParts[0];
  const ranks = fenBoard.split('/');

  // Convert FEN ranks to board array
  const board: (string | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  ranks.forEach((rankStr, fenRankIdx) => {
    const boardRankIdx = 7 - fenRankIdx;
    let fileIdx = 0;
    for (const char of rankStr) {
      if (/\d/.test(char)) {
        fileIdx += parseInt(char);
      } else {
        board[boardRankIdx][fileIdx] = char;
        fileIdx++;
      }
    }
  });

  // Apply move: move piece from source to destination
  const piece = board[fromRank][fromFile];
  board[toRank][toFile] = piece;
  board[fromRank][fromFile] = null;

  // Convert board back to FEN
  const newRanks = board
    .map((rankArray) => {
      let rankStr = '';
      let emptyCount = 0;

      rankArray.forEach((square) => {
        if (square === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rankStr += emptyCount;
            emptyCount = 0;
          }
          rankStr += square;
        }
      });

      if (emptyCount > 0) {
        rankStr += emptyCount;
      }
      return rankStr;
    })
    .reverse()
    .join('/');

  // Return updated FEN (simplified - only updates board, keeps other parts)
  return `${newRanks} ${fenParts[1]} ${fenParts[2]} ${fenParts[3]} ${fenParts[4]} ${fenParts[5]}`;
};

/**
 * PlayScreen Props
 */
export interface PlayScreenProps {
  gameId: string;
  screenConfig?: Partial<PlayScreenConfig>;
}

/**
 * PlayScreen Component
 *
 * Main component for displaying an active chess game.
 * Currently a placeholder that displays game information.
 *
 * Features:
 * - Shows game ID
 * - Loading states
 * - Responsive layout
 */
export const PlayScreen = ({ gameId, screenConfig }: PlayScreenProps) => {
  const screenConfigObj = createPlayScreenConfig(screenConfig);

  const [gameState, setGameState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    players: ['Player 1', 'Player 2'],
    moves: [] as Move[],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
  });

    const handleMove = (from: string, to: string) => {
    const newMoveNumber = gameState.moves.length + 1;
    const playerColor = gameState.sideToMove === 'w' ? 'White' : 'Black';
    const moveAlgebraic = `${from}${to}`;
    
    console.log(`\n[PLAY_SCREEN] Move #${newMoveNumber}: ${playerColor} moves ${from} → ${to}`);
    console.log(`[PLAY_SCREEN] Side to move BEFORE: ${gameState.sideToMove}`);
    
    // Determine the next side to move
    const nextSideToMove = gameState.sideToMove === 'w' ? 'b' : 'w';
    
    // Calculate new FEN after move
    const newFEN = applyMoveToFEN(gameState.fen, moveAlgebraic);
    console.log(`[PLAY_SCREEN] FEN updated: ${newFEN}`);
    
    // Convert FEN to board for game state checking
    const fenParts = newFEN.split(' ');
    const fenBoard = fenParts[0];
    const ranks = fenBoard.split('/');
    const boardArray: (string | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    ranks.forEach((rankStr, fenRankIdx) => {
      const boardRankIdx = 7 - fenRankIdx;
      let fileIdx = 0;
      for (const char of rankStr) {
        if (/\d/.test(char)) {
          fileIdx += parseInt(char);
        } else {
          boardArray[boardRankIdx][fileIdx] = char;
          fileIdx++;
        }
      }
    });
    
    // Cast to Board type (pieces are represented as strings like 'w', 'p', etc)
    const board = boardArray as unknown as Board;
    
    // Check for checkmate or stalemate for opponent
    let newStatus: 'in_progress' | 'ended' = 'in_progress';
    let endReason = '';
    
    if (isCheckmate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = `Checkmate! ${playerColor} wins!`;
      console.log(`[PLAY_SCREEN] CHECKMATE DETECTED: ${playerColor} wins!`);
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
      console.log(`[PLAY_SCREEN] STALEMATE DETECTED: Game is a draw`);
    }
    
    // Create the move object
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: gameState.sideToMove,
      san: moveAlgebraic
    };

    const updatedMoves = [...gameState.moves, moveObj];

    // Update state
    setGameState(prev => ({
      ...prev,
      moves: updatedMoves,
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      endReason: endReason,
    }));

    console.log(`[PLAY_SCREEN] Side to move AFTER: ${nextSideToMove}`);
    console.log(`[PLAY_SCREEN] Total moves: ${updatedMoves.length}`);
  };

  const handleResign = () => {
    console.log('Player resigned');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Chess Game</Text>
          <Text style={styles.gameId}>Game ID: {gameId}</Text>
        </View>

        {/* Opponent Panel */}
        <PlayerPanel
          position="top"
          color="b"
          isSelf={false}
          isActive={gameState.sideToMove === 'b'}
          remainingMs={600000}
          accountId="opponent123"
        />

        {/* Chess Board */}
        <View style={styles.boardSection}>
          <ChessBoard
            {...getHydratedBoardProps(screenConfigObj)}
            fen={gameState.fen}
            sideToMove={gameState.sideToMove}
            myColor={gameState.sideToMove}
            isInteractive={gameState.status === 'in_progress'}
            onMove={handleMove}
          />
        </View>

        {/* Self Player Panel */}
        <PlayerPanel
          position="bottom"
          color="w"
          isSelf={true}
          isActive={gameState.sideToMove === 'w'}
          remainingMs={300000}
          accountId="you123"
        />

        {/* Game Actions */}
        <GameActions
          status={gameState.status}
          endReason={gameState.endReason}
          onResign={handleResign}
        />

        {/* Move List */}
        <View style={styles.moveListSection}>
          <MoveList moves={gameState.moves} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Game Status</Text>
          <Text style={styles.infoText}>Status: {gameState.status}</Text>
          <Text style={styles.infoText}>Players: {gameState.players.join(' vs ')}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Text style={styles.infoText}>Board Size: {screenConfigObj.board.size}px</Text>
          <Text style={styles.infoText}>Board Theme: {screenConfigObj.theme.boardTheme}</Text>
          <Text style={styles.infoText}>Theme Mode: {screenConfigObj.theme.mode}</Text>
          <Text style={styles.infoText}>API Base: {screenConfigObj.apiBaseUrl}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  gameId: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New',
  },
  boardSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  moveListSection: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
