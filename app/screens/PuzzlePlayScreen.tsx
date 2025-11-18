import { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
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

interface PuzzlePlayScreenProps {
  puzzleId: string;
  onComplete?: (data: Record<string, unknown>) => void;
  screenConfig?: Partial<PlayScreenConfig>;
}

/**
 * PuzzlePlayScreen Component
 *
 * Displays a chess puzzle for the user to solve.
 * Currently a placeholder showing puzzle information.
 */
export const PuzzlePlayScreen = ({
  puzzleId,
  onComplete,
  screenConfig,
}: PuzzlePlayScreenProps) => {
  const screenConfigObj = createPlayScreenConfig(screenConfig);
  const [status, setStatus] = useState('');
  const [error] = useState<string | null>(null);
  const [puzzleState, setPuzzleState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4',
    moves: [] as Move[],
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
  });

  const handleMove = (from: string, to: string) => {
    const newMoveNumber = puzzleState.moves.length + 1;
    const playerColor = puzzleState.sideToMove === 'w' ? 'White' : 'Black';
    const moveAlgebraic = `${from}${to}`;
    
    console.log(`\n[PUZZLE_SCREEN] Move #${newMoveNumber}: ${playerColor} moves ${from} → ${to}`);
    console.log(`[PUZZLE_SCREEN] Side to move BEFORE: ${puzzleState.sideToMove}`);
    
    // Determine the next side to move
    const nextSideToMove = puzzleState.sideToMove === 'w' ? 'b' : 'w';
    
    // Calculate new FEN after move
    const newFEN = applyMoveToFEN(puzzleState.fen, moveAlgebraic);
    console.log(`[PUZZLE_SCREEN] FEN updated: ${newFEN}`);
    
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
      endReason = `Puzzle Solved! ${playerColor} wins!`;
      console.log(`[PUZZLE_SCREEN] CHECKMATE DETECTED: ${playerColor} wins!`);
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
      console.log(`[PUZZLE_SCREEN] STALEMATE DETECTED: Game is a draw`);
    }
    
    // Create the move object
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: puzzleState.sideToMove,
      san: moveAlgebraic
    };

    const updatedMoves = [...puzzleState.moves, moveObj];

    // Update state
    setPuzzleState(prev => ({
      ...prev,
      moves: updatedMoves,
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      endReason: endReason,
    }));

    console.log(`[PUZZLE_SCREEN] Side to move AFTER: ${nextSideToMove}`);
    console.log(`[PUZZLE_SCREEN] Total moves: ${updatedMoves.length}`);
  };

  const handleSubmit = () => {
    setStatus('Puzzle submitted!');
    if (onComplete) {
      onComplete({
        puzzleId,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>Daily Puzzle</Text>
        <Text style={styles.puzzleId}>Puzzle ID: {puzzleId}</Text>

        {/* Puzzle Author Panel */}
        <PlayerPanel
          position="top"
          color="b"
          isSelf={false}
          isActive={puzzleState.sideToMove === 'b'}
          remainingMs={0}
          accountId="puzzle_author"
        />

        {/* Chess Board */}
        <View style={styles.boardSection}>
          <ChessBoard
            {...getHydratedBoardProps(screenConfigObj)}
            fen={puzzleState.fen}
            sideToMove={puzzleState.sideToMove}
            myColor={puzzleState.sideToMove}
            isInteractive={puzzleState.status === 'in_progress'}
            onMove={handleMove}
          />
        </View>

        {/* Self Panel */}
        <PlayerPanel
          position="bottom"
          color="w"
          isSelf={true}
          isActive={puzzleState.sideToMove === 'w'}
          remainingMs={0}
          accountId="you123"
        />

        {/* Game Actions */}
        <GameActions
          status={puzzleState.status}
          endReason={puzzleState.endReason}
        />

        {/* Move List */}
        <View style={styles.moveListSection}>
          <MoveList moves={puzzleState.moves} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Difficulty: Medium</Text>
          <Text style={styles.infoLabel}>Rating: 1200</Text>
          <Text style={styles.infoLabel}>Board Theme: {screenConfigObj.theme.boardTheme}</Text>
          <Text style={styles.infoLabel}>API Base: {screenConfigObj.apiBaseUrl}</Text>
        </View>

        {status && <Text style={styles.status}>{status}</Text>}

        <View style={styles.controls}>
          <Button
            title="Submit Solution"
            onPress={handleSubmit}
            color="#007AFF"
          />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  puzzleId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  boardSection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  moveListSection: {
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  status: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  controls: {
    marginTop: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    padding: 20,
  },
});