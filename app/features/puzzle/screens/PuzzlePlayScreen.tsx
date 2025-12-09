import {useCallback, useState} from 'react';
import {Dimensions} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {ChessBoard} from '@/features/board';
import {GameActions, GameHeaderCard, MoveList, PawnPromotionModal, type PieceType, PlayerCard} from '@/features/game';
import {createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig} from '@/features/board/config';
import {applyMoveToFENSimple, type Board, isCheckmate, isStalemate, parseFENToBoard} from '@/core/utils';
import {useReducedMotion} from '@/features/board/hooks/useReducedMotion';
import {Box} from '@/ui/primitives/Box';
import {VStack} from '@/ui/primitives/Stack';
import {Card} from '@/ui/primitives/Card';
import {useThemeTokens} from '@/ui/hooks/useThemeTokens';
import {spacingTokens} from '@/ui/tokens/spacing';
import {Move} from "@/core/utils/chess";

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
  puzzleId: _puzzleId,
  onComplete: _onComplete,
  screenConfig,
}: PuzzlePlayScreenProps) => {
  const { colors } = useThemeTokens();
  const screenConfigObj = createPlayScreenConfig(screenConfig);
  const reduceMotion = useReducedMotion();
  
  const [error] = useState<string | null>(null);
  const [puzzleState, setPuzzleState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4',
    moves: [] as Move[],
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
  });

  // Promotion modal state
  const [promotionState, setPromotionState] = useState({
    isVisible: false,
    move: null as { from: string; to: string } | null,
  });

  // Calculate board size (screen width - padding, max 420px)
  const BOARD_SIZE = Math.min(Dimensions.get('window').width - 48, 420);

  /**
   * Check if a move requires pawn promotion
   */
  const checkPromotion = useCallback((from: string, to: string, fen: string, sideToMove: 'w' | 'b'): boolean => {
    const board = parseFENToBoard(fen);
    const fromSquare = board.find(p => p.square === from);
    
    if (!fromSquare || fromSquare.type !== 'p') return false;
    
    const toRank = to[1];
    return (sideToMove === 'w' && toRank === '8') || (sideToMove === 'b' && toRank === '1');
  }, []);

  /**
   * Handle move from the chess board
   * Checks for pawn promotion before making the move
   */
  const handleMove = useCallback((from: string, to: string, promotion?: PieceType) => {
    const needsPromotion = checkPromotion(from, to, puzzleState.fen, puzzleState.sideToMove);

    if (needsPromotion && !promotion) {
      setPromotionState({ isVisible: true, move: { from, to } });
      return;
    }

    const newMoveNumber = puzzleState.moves.length + 1;
    const playerColor = puzzleState.sideToMove === 'w' ? 'White' : 'Black';
    const moveAlgebraic = `${from}${to}${promotion || ''}`;
    
    console.log(`[PUZZLE_SCREEN] Move #${newMoveNumber}: ${playerColor} moves ${from} → ${to}`);
    
    // Determine the next side to move
    const nextSideToMove = puzzleState.sideToMove === 'w' ? 'b' : 'w';
    
    // Calculate new FEN after move
    const newFEN = applyMoveToFENSimple(puzzleState.fen, moveAlgebraic);
    console.log(`[PUZZLE_SCREEN] FEN updated: ${newFEN}`);
    
    // Convert FEN to engine Board (Piece objects)
    const board: Board = parseFENToBoard(newFEN);
    
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
  }, [puzzleState, checkPromotion]);

  /**
   * Handle pawn promotion selection
   */
  const handlePawnPromotion = useCallback((piece: PieceType) => {
    if (!promotionState.move) return;

    const { from, to } = promotionState.move;
    handleMove(from, to, piece);
    setPromotionState({ isVisible: false, move: null });
  }, [promotionState.move, handleMove]);

  /**
   * Create animation configuration based on accessibility
   */
  const createAnimConfig = useCallback(
    (delay: number) => (reduceMotion ? undefined : FadeInUp.duration(250).delay(delay)),
    [reduceMotion]
  );

  // Board props matching PlayScreen structure
  const boardProps = {
    ...getHydratedBoardProps(screenConfigObj),
    fen: puzzleState.fen,
    sideToMove: puzzleState.sideToMove,
    myColor: puzzleState.sideToMove,
    orientation: (puzzleState.sideToMove === 'w' ? 'white' : 'black') as 'white' | 'black',
    isInteractive: puzzleState.status === 'in_progress',
    onMove: handleMove,
  };

  if (error) {
    return (
      <Box flex={1} style={{ backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center', padding: spacingTokens[5] }}>
        <Card variant="elevated" size="md">
          <VStack gap={spacingTokens[3]} style={{ alignItems: 'center' }}>
            <Text variant="body" style={{ color: colors.status.error, textAlign: 'center' }}>
              {error}
            </Text>
          </VStack>
        </Card>
      </Box>
    );
  }

  return (
    <Box flex={1} style={{ backgroundColor: colors.background.primary, padding: spacingTokens[4] }}>
      <VStack flex={1} gap={spacingTokens[4]}>
        {/* Game Header */}
        <GameHeaderCard
          status={puzzleState.status === 'in_progress' ? 'live' : 'ended'}
          gameMode="Puzzle"
          timeControl={`Rating: 1200`}
          isRated={false}
        />

        {/* Main Game Area: Left Column (Players + Board + Actions) + Right Column (Move List) */}
        <Box style={{ flexDirection: 'row', flex: 1, gap: spacingTokens[4] }}>
          {/* Left Column - 50% */}
          <VStack flex={1} gap={spacingTokens[4]}>
            {/* Top Player Card (Puzzle Author/Opponent) */}
            <Animated.View entering={createAnimConfig(0)}>
              <PlayerCard
                color="b"
                name="Puzzle"
                rating={1200}
                isSelf={false}
                isActive={puzzleState.sideToMove === 'b'}
                remainingMs={0}
                capturedPieces={[]}
              />
            </Animated.View>

            {/* Chess Board */}
            <Animated.View entering={createAnimConfig(50)} style={{ alignItems: 'center' }}>
              <Card variant="elevated" size="md" padding={0}>
                <ChessBoard
                  {...boardProps}
                  size={BOARD_SIZE}
                  squareSize={BOARD_SIZE / 8}
                />
              </Card>
            </Animated.View>

            {/* Bottom Player Card (You) */}
            <Animated.View entering={createAnimConfig(150)}>
              <PlayerCard
                color="w"
                name="You"
                rating={0}
                isSelf={true}
                isActive={puzzleState.sideToMove === 'w'}
                remainingMs={0}
                capturedPieces={[]}
              />
            </Animated.View>

            {/* Game Actions */}
            <Animated.View entering={createAnimConfig(200)}>
              <GameActions
                status={puzzleState.status}
                result={puzzleState.status === 'ended' ? '1-0' : undefined}
                endReason={puzzleState.endReason}
                sideToMove={puzzleState.sideToMove}
              />
            </Animated.View>
          </VStack>

          {/* Right Column - 50% - Full Height Move List */}
          <Animated.View entering={createAnimConfig(100)} style={{ flex: 1 }}>
            <Card variant="default" size="md" padding={0} style={{ flex: 1 }}>
              <MoveList moves={puzzleState.moves} />
            </Card>
          </Animated.View>
        </Box>
      </VStack>

      {/* Pawn Promotion Modal */}
      <PawnPromotionModal
        visible={promotionState.isVisible}
        color={puzzleState.sideToMove}
        onSelect={handlePawnPromotion}
        onCancel={() => setPromotionState({ isVisible: false, move: null })}
      />
    </Box>
  );
};