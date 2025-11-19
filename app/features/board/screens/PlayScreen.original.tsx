import { useState, useEffect } from 'react';
import { ScrollView, Platform, Dimensions, AccessibilityInfo } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChessBoard } from '@/features/board';
import { 
  GameActions, 
  MoveList, 
  PlayerCard,
  GameHeaderCard,
  GameInfo,
  GameResultModal, 
  PawnPromotionModal, 
  type Move, 
  type PieceType 
} from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig } from '@/features/board/config';
import { isCheckmate, isStalemate, parseFENToBoard, applyMoveToFENSimple, type Board } from '@/core/utils';
import { Box } from '@/ui/primitives/Box';
import { VStack, HStack } from '@/ui/primitives/Stack';
import { Card } from '@/ui/primitives/Card';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

const { width } = Dimensions.get('window');
const isWideLayout = width >= 768; // Tablet and desktop use side-by-side layout

export interface PlayScreenProps {
  gameId: string;
  screenConfig?: Partial<PlayScreenConfig>;
}

export function PlayScreen(): React.ReactElement {
  const screenConfigObj = createPlayScreenConfig();
  const { colors } = useThemeTokens();

  const [gameState, setGameState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    players: ['Player 1', 'Player 2'],
    moves: [] as Move[],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
    result: null as '1-0' | '0-1' | '1/2-1/2' | null,
    lastMove: null as { from: string; to: string } | null,
    capturedByWhite: [] as string[], // Pieces captured by white
    capturedByBlack: [] as string[], // Pieces captured by black
  });

  const [showResultModal, setShowResultModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);
  const [whiteTimeMs, setWhiteTimeMs] = useState(600000); // 10 minutes
  const [blackTimeMs, setBlackTimeMs] = useState(600000);

  const endGame = (result: '1-0' | '0-1' | '1/2-1/2', reason: string) => {
    setGameState(prev => ({
      ...prev,
      status: 'ended',
      result,
      endReason: reason,
    }));
    setShowResultModal(true);
  };

  const handleTimeExpire = (color: 'w' | 'b') => {
    const winner = color === 'w' ? '0-1' : '1-0';
    const loser = color === 'w' ? 'White' : 'Black';
    endGame(winner, `${loser} ran out of time`);
  };

  const handleMove = (from: string, to: string) => {
    const currentBoard = parseFENToBoard(gameState.fen);
    const fromRank = 8 - parseInt(from[1]);
    const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
    const movingPiece = currentBoard[fromRank]?.[fromFile];
    
    // Check for pawn promotion
    if (movingPiece && movingPiece.type.toLowerCase() === 'p') {
      const toRankNum = parseInt(to[1]);
      if ((movingPiece.color === 'w' && toRankNum === 8) || 
          (movingPiece.color === 'b' && toRankNum === 1)) {
        // Show promotion modal
        setPromotionMove({ from, to });
        setShowPromotionModal(true);
        return;
      }
    }
    
    const newMoveNumber = gameState.sideToMove === 'w' 
      ? Math.floor(gameState.moves.length / 2) + 1
      : Math.floor(gameState.moves.length / 2) + 1;
    
    const moveAlgebraic = `${from}${to}`;
    
    // Check if a piece was captured
    const toRank = 8 - parseInt(to[1]);
    const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
    const capturedPiece = currentBoard[toRank]?.[toFile];
    
    const newCapturedByWhite = [...gameState.capturedByWhite];
    const newCapturedByBlack = [...gameState.capturedByBlack];
    
    if (capturedPiece) {
      const pieceType = capturedPiece.type.toLowerCase();
      if (gameState.sideToMove === 'w') {
        newCapturedByWhite.push(pieceType);
      } else {
        newCapturedByBlack.push(pieceType);
      }
    }
    
    const nextSideToMove = gameState.sideToMove === 'w' ? 'b' : 'w';
    const newFEN = applyMoveToFENSimple(gameState.fen, moveAlgebraic);
    const board: Board = parseFENToBoard(newFEN);
    
    let newStatus: 'in_progress' | 'ended' = 'in_progress';
    let endReason = '';
    
    if (isCheckmate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = `Checkmate!`;
      const result: '1-0' | '0-1' = gameState.sideToMove === 'w' ? '1-0' : '0-1';
      setGameState(prev => ({
        ...prev,
        moves: [...prev.moves, moveObj],
        fen: newFEN,
        sideToMove: nextSideToMove,
        status: newStatus,
        result,
        endReason,
        lastMove: { from, to },
        capturedByWhite: newCapturedByWhite,
        capturedByBlack: newCapturedByBlack,
      }));
      setShowResultModal(true);
      return;
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
      setGameState(prev => ({
        ...prev,
        moves: [...prev.moves, moveObj],
        fen: newFEN,
        sideToMove: nextSideToMove,
        status: newStatus,
        result: '1/2-1/2',
        endReason,
        lastMove: { from, to },
        capturedByWhite: newCapturedByWhite,
        capturedByBlack: newCapturedByBlack,
      }));
      setShowResultModal(true);
      return;
    }
    
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: gameState.sideToMove,
      san: moveAlgebraic
    };

    setGameState(prev => ({
      ...prev,
      moves: [...prev.moves, moveObj],
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      endReason: endReason,
      lastMove: { from, to },
      capturedByWhite: newCapturedByWhite,
      capturedByBlack: newCapturedByBlack,
    }));
  };

  const handleResign = () => {
    const winner = gameState.sideToMove === 'w' ? '0-1' : '1-0';
    const resigningPlayer = gameState.sideToMove === 'w' ? 'White' : 'Black';
    endGame(winner, `${resigningPlayer} resigned`);
  };

  const handlePawnPromotion = (piece: PieceType) => {
    if (!promotionMove) return;
    
    const { from, to } = promotionMove;
    
    // Apply move with promotion - modify FEN to include promoted piece
    const moveAlgebraic = `${from}${to}${piece}`;
    const newFEN = applyMoveToFENSimple(gameState.fen, moveAlgebraic);
    
    const currentBoard = parseFENToBoard(gameState.fen);
    const toRank = 8 - parseInt(to[1]);
    const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
    const capturedPiece = currentBoard[toRank]?.[toFile];
    
    const newCapturedByWhite = [...gameState.capturedByWhite];
    const newCapturedByBlack = [...gameState.capturedByBlack];
    
    if (capturedPiece) {
      const pieceType = capturedPiece.type.toLowerCase();
      if (gameState.sideToMove === 'w') {
        newCapturedByWhite.push(pieceType);
      } else {
        newCapturedByBlack.push(pieceType);
      }
    }
    
    const nextSideToMove = gameState.sideToMove === 'w' ? 'b' : 'w';
    const board: Board = parseFENToBoard(newFEN);
    
    const newMoveNumber = gameState.sideToMove === 'w' 
      ? Math.floor(gameState.moves.length / 2) + 1
      : Math.floor(gameState.moves.length / 2) + 1;
    
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: gameState.sideToMove,
      san: `${from}${to}=${piece.toUpperCase()}`
    };

    let newStatus: 'in_progress' | 'ended' = 'in_progress';
    let endReason = '';
    let result: '1-0' | '0-1' | '1/2-1/2' | null = null;
    
    if (isCheckmate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = `Checkmate!`;
      result = gameState.sideToMove === 'w' ? '1-0' : '0-1';
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
      result = '1/2-1/2';
    }

    setGameState(prev => ({
      ...prev,
      moves: [...prev.moves, moveObj],
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      result,
      endReason,
      lastMove: { from, to },
      capturedByWhite: newCapturedByWhite,
      capturedByBlack: newCapturedByBlack,
    }));
    
    setShowPromotionModal(false);
    setPromotionMove(null);
    
    if (newStatus === 'ended') {
      setShowResultModal(true);
    }
  };

  // Check for reduced motion preference
  const [reduceMotion, setReduceMotion] = useState(false);
  
  useEffect(() => {
    const checkReducedMotion = async () => {
      const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(isEnabled);
    };
    checkReducedMotion();
  }, []);

  // Animation config: 250ms duration, 50ms stagger
  const animConfig = (delay: number) => 
    reduceMotion ? undefined : FadeInUp.duration(250).delay(delay);

  // Responsive board configuration
  const boardSize = isWideLayout ? 480 : Math.min(width - 48, 420);
  const responsiveBoardConfig = {
    ...screenConfigObj.board,
    size: boardSize,
    squareSize: boardSize / 8,
  };

  return (
    <Box flex={1} style={{ backgroundColor: colors.background.primary }}>
      {/* ===== <GameHeader /> ===== */}
      <Box style={{ padding: spacingTokens[6], paddingBottom: spacingTokens[3] }}>
        <GameHeaderCard
          status={gameState.status === 'in_progress' ? 'live' : 'ended'}
          gameMode="Blitz"
          timeControl="10+0"
          isRated={true}
        />
      </Box>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacingTokens[6],
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <VStack gap={spacingTokens[10]}>
          {/* Top Player */}
          <Animated.View entering={animConfig(0)}>
            <PlayerCard
              color="b"
              name="Opponent"
              rating={1500}
              isSelf={false}
              isActive={gameState.sideToMove === 'b'}
              remainingMs={blackTimeMs}
              capturedPieces={gameState.capturedByWhite}
              onTimeExpire={() => handleTimeExpire('b')}
            />
          </Animated.View>

          {/* Board + MoveList (side-by-side on wide screens) */}
          {isWideLayout ? (
            <HStack gap={spacingTokens[6]} alignItems="flex-start">
              {/* Board */}
              <Animated.View entering={animConfig(50)}>
                <Card variant="elevated" size="md" padding={0}>
                  <ChessBoard
                    {...getHydratedBoardProps(screenConfigObj)}
                    size={responsiveBoardConfig.size}
                    squareSize={responsiveBoardConfig.squareSize}
                    fen={gameState.fen}
                    sideToMove={gameState.sideToMove}
                    myColor={gameState.sideToMove}
                    orientation={gameState.sideToMove === 'w' ? 'white' : 'black'}
                    onMove={handleMove}
                    isInteractive={gameState.status === 'in_progress'}
                    lastMove={gameState.lastMove}
                  />
                </Card>
              </Animated.View>

              {/* MoveList beside board */}
              <Animated.View entering={animConfig(100)} style={{ flex: 1 }}>
                <Card 
                  variant="default" 
                  size="md" 
                  padding={0} 
                  style={{ height: boardSize, minHeight: 300 }}
                >
                  <MoveList moves={gameState.moves} />
                </Card>
              </Animated.View>
            </HStack>
          ) : (
            <VStack gap={spacingTokens[6]}>
              {/* Board */}
              <Animated.View entering={animConfig(50)}>
                <Card variant="elevated" size="md" padding={0}>
                  <ChessBoard
                    {...getHydratedBoardProps(screenConfigObj)}
                    size={responsiveBoardConfig.size}
                    squareSize={responsiveBoardConfig.squareSize}
                    fen={gameState.fen}
                    sideToMove={gameState.sideToMove}
                    myColor={gameState.sideToMove}
                    orientation={gameState.sideToMove === 'w' ? 'white' : 'black'}
                    onMove={handleMove}
                    isInteractive={gameState.status === 'in_progress'}
                    lastMove={gameState.lastMove}
                  />
                </Card>
              </Animated.View>

              {/* MoveList below board on mobile */}
              <Animated.View entering={animConfig(100)}>
                <Card variant="default" size="md" padding={0} style={{ minHeight: 300 }}>
                  <MoveList moves={gameState.moves} />
                </Card>
              </Animated.View>
            </VStack>
          )}

          {/* Bottom Player */}
          <Animated.View entering={animConfig(150)}>
            <PlayerCard
              color="w"
              name="You"
              rating={1450}
              isSelf={true}
              isActive={gameState.sideToMove === 'w'}
              remainingMs={whiteTimeMs}
              capturedPieces={gameState.capturedByBlack}
              onTimeExpire={() => handleTimeExpire('w')}
            />
          </Animated.View>

          {/* GameActions */}
          <Animated.View entering={animConfig(200)}>
            <Card variant="default" size="md" padding={16}>
              <GameActions
                status={gameState.status}
                result={gameState.status === 'ended' ? '1-0' : null}
                endReason={gameState.endReason}
                onResign={handleResign}
              />
            </Card>
          </Animated.View>
        </VStack>
      </ScrollView>
      
      {/* Pawn Promotion Modal */}
      <PawnPromotionModal
        visible={showPromotionModal}
        color={gameState.sideToMove}
        onSelect={handlePawnPromotion}
        onCancel={() => {
          setShowPromotionModal(false);
          setPromotionMove(null);
        }}
      />
      
      {/* Game Result Modal */}
      {gameState.result && (
        <GameResultModal
          visible={showResultModal}
          result={gameState.result}
          reason={gameState.endReason}
          isPlayerWhite={true}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </Box>
  );
}
