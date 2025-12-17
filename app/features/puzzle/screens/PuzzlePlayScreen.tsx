import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FadeInUp} from 'react-native-reanimated';
import {PawnPromotionModal, type PieceType} from '@/features/game';
import {createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig} from '@/features/board/config';
import {moveToFen} from '@/core/utils/chess/logic/parsing';
import {ChessJsAdapter} from '@/core/utils/chess';
import {useReducedMotion} from '@/features/board/hooks/useReducedMotion';
import {useBoardLayout} from '@/features/board/hooks/useBoardLayout';
import {usePromotionModal} from '@/features/board/hooks/usePromotionModal';
import {Box} from '@/ui/primitives/Box';
import {useThemeTokens} from '@/ui/hooks/useThemeTokens';
import {spacingTokens} from '@/ui/tokens/spacing';
import {entranceAnimations} from '@/ui/animations/presets';
import type {Move} from '@/types/game';
import {useBoardTheme} from '@/contexts/BoardThemeContext';
import {DevBadge} from '@/ui/primitives/DevBadge';
import {MovesColumn} from '@/features/board/components/MovesColumn';
import {useGetPuzzle} from '@/features/puzzle/hooks/useGetPuzzle';
import {ChessBoard} from '@/features/board';
import {Card} from '@/ui/primitives/Card';
import {usePuzzleAttempt} from '@/features/puzzle/hooks/usePuzzleAttempt';
import {Text} from '@/ui/primitives/Text';
import {useI18n} from '@/i18n/I18nContext';

interface PuzzlePlayScreenProps {
  puzzleId?: string;
  onComplete?: (data: Record<string, unknown>) => void;
  screenConfig?: Partial<PlayScreenConfig>;
  daily?: boolean;
}

export const PuzzlePlayScreen: React.FC<PuzzlePlayScreenProps> = ({ puzzleId: _puzzleId, onComplete: _onComplete, screenConfig, daily = false }) => {
  const { colors } = useThemeTokens();
  const { boardTheme, pieceTheme } = useBoardTheme();
  const screenConfigObj = useMemo(
    () => createPlayScreenConfig({ ...(screenConfig || {}), theme: { boardTheme: boardTheme as any, pieceTheme: pieceTheme as any } as any }),
    [screenConfig, boardTheme, pieceTheme],
  );

  const reduceMotion = useReducedMotion();
    const {isHorizontalLayout, boardSize, squareSize, movesColumnFlex, onLayout} = useBoardLayout();
  const { puzzle, loading: puzzleLoading, error: puzzleError, fetchDailyPuzzle, fetchRandomPuzzle } = useGetPuzzle();
  const { t } = useI18n();

  const [movesPlayed, setMovesPlayed] = useState<string[]>([]);

  const [puzzleState, setPuzzleState] = useState<{
    status: 'in_progress' | 'ended';
    fen: string;
    sideToMove: 'w' | 'b';
    moves: Move[];
    endReason?: string;
  }>({
    status: 'in_progress',
    fen: '',
    sideToMove: 'w',
    moves: [],
    endReason: '',
  });

  const [promotionState, promotionActions] = usePromotionModal();

  // loadPuzzle will be defined as a stable callback so we can reference it from other callbacks
  const loadPuzzle = useCallback(async () => {
    setMovesPlayed([]);

    try {
      if (daily) {
        await fetchDailyPuzzle();
      } else {
        await fetchRandomPuzzle();
      }
    } catch {
      // Error handled by useGetPuzzle hook
    }
  }, [daily, fetchDailyPuzzle, fetchRandomPuzzle]);

  // Update puzzle state when puzzle is fetched
  useEffect(() => {
    if (puzzle) {
      const fen = puzzle?.problem?.fen ?? puzzle?.fen ?? puzzleState.fen;
      const side = puzzle?.problem?.side_to_move ?? puzzle?.problem?.sideToMove ?? puzzle?.sideToMove ?? puzzleState.sideToMove;
      setPuzzleState(prev => ({ ...prev, fen, sideToMove: side, moves: [], status: 'in_progress', endReason: '' }));
    }
  }, [puzzle]);

    // onSolved should reload a new puzzle; keep a stable reference
  const onSolvedCallback = useCallback(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

    const {submitDebounced, guidance, cancel} = usePuzzleAttempt({
    puzzleId: puzzle?.id ?? '',
    debounceMs: 250,
    onSolved: onSolvedCallback,
  });

  useEffect(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  const checkPromotion = useCallback(
    (from: string, to: string, fen: string, sideToMove: 'w' | 'b') => promotionActions.checkPromotion(from, to, fen, sideToMove),
    [promotionActions],
  );

  const handleMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      const needsPromotion = checkPromotion(from, to, puzzleState.fen, puzzleState.sideToMove);
      if (needsPromotion && !promotion) {
        promotionActions.showPromotion(from, to);
        return;
      }

      const moveAlgebraic = `${from}${to}${promotion ?? ''}`;
      const newMoves = [...movesPlayed, moveAlgebraic];
      setMovesPlayed(newMoves);
      const nextSideToMove = puzzleState.sideToMove === 'w' ? 'b' : 'w';
      const newFEN = moveToFen(puzzleState.fen, moveAlgebraic);

      const adapter = new ChessJsAdapter(newFEN);
      let newStatus: 'in_progress' | 'ended' = 'in_progress';
      let endReason = '';
      if (adapter.isCheckmate()) {
        newStatus = 'ended';
        endReason = t('puzzle.solved') ?? 'Puzzle Solved!';
      } else if (adapter.isStalemate()) {
        newStatus = 'ended';
        endReason = t('puzzle.stalemate') ?? 'Stalemate - Game is a draw';
      }

      const moveObj: Move = { moveNumber: puzzleState.moves.length + 1, color: puzzleState.sideToMove, san: moveAlgebraic };
      setPuzzleState(prev => ({ ...prev, moves: [...prev.moves, moveObj], fen: newFEN, sideToMove: nextSideToMove, status: newStatus, endReason }));

      // map internal puzzle status to API attempt status enum
      const attemptStatus = newStatus === 'in_progress' ? 'IN_PROGRESS' : (adapter.isCheckmate() ? 'SUCCESS' : 'FAILED');
      submitDebounced({ isDaily: false, movesPlayed: newMoves, status: attemptStatus as any, timeSpentMs: 0, hintsUsed: 0 });
    },
    [puzzleState, movesPlayed, promotionActions, checkPromotion, submitDebounced, t],
  );

  const handlePawnPromotion = useCallback(
    (piece: PieceType) => {
      if (!promotionState.move) return;
      const { from, to } = promotionState.move;
      handleMove(from, to, piece as string);
      promotionActions.hidePromotion();
    },
    [promotionState.move, handleMove, promotionActions],
  );

  const createAnimConfig = useCallback(
    (delay: number) =>
      reduceMotion
        ? undefined
        : FadeInUp.duration(entranceAnimations.fadeInUp.config.duration ?? 250).delay(delay),
    [reduceMotion],
  );

    const interactive = puzzleState.status === 'in_progress';

  const boardProps = useMemo(
    () => ({
      ...getHydratedBoardProps(screenConfigObj),
      fen: puzzleState.fen,
      sideToMove: puzzleState.sideToMove,
      myColor: puzzleState.sideToMove,
      isInteractive: interactive,
      onMove: handleMove,
    }),
    [screenConfigObj, puzzleState, handleMove, interactive],
  );

  return (
    <>
      {puzzleLoading && (
        <Box padding={4}>
          <Text>{t('loading') ?? 'Loading...'}</Text>
        </Box>
      )}

      {!puzzleLoading && puzzleError && (
        <Box padding={4}>
          <Text>{puzzleError}</Text>
        </Box>
      )}

      {!puzzleLoading && !puzzleError && puzzle && (
        <Box style={{ flex: 1 }} onLayout={onLayout}>
            <Box flexDirection={isHorizontalLayout ? 'row' : 'column'} flex={1} gap={4}>
                <Box alignItems="center" style={{width: isHorizontalLayout ? boardSize : '100%'}}>
                    <Card variant="glass" size="md" padding={0}>
                        {boardProps.fen ? <ChessBoard {...boardProps} size={boardSize} squareSize={squareSize}/> : null}
                    </Card>
                </Box>
                <MovesColumn moves={puzzleState.moves} anim={createAnimConfig(100)} flex={movesColumnFlex}/>
            </Box>
        </Box>
      )}

      {guidance && guidance.length > 0 && (
        <Box
          padding={2}
          marginBottom={2}
          backgroundColor={colors.background.secondary}
          radius="md"
        >
          <Box>
            <Text>{t('puzzle.suggestedFollowups') ?? 'Suggested followups (progressive):'}</Text>
          </Box>
          {guidance.map((g: any, idx: number) => (
            <Box key={idx}>
              <Text mono>{JSON.stringify(g)}</Text>
            </Box>
          ))}
        </Box>
      )}

      {__DEV__ && (
        <DevBadge style={{ position: 'absolute', top: spacingTokens[3], right: spacingTokens[3] }}>
          <Box gap={4}>
            <Box>
              <Text>{`puzzle: ${puzzle?.id ?? 'n/a'}`}</Text>
            </Box>
            <Box>
              <Text>{`sideToMove: ${puzzleState.sideToMove}`}</Text>
            </Box>
            <Box>
              <Text>{`puzzleFen: ${puzzle?.problem?.fen ?? puzzleState.fen}`}</Text>
            </Box>
          </Box>
        </DevBadge>
      )}

      <PawnPromotionModal
        visible={promotionState.isVisible}
        color={puzzleState.sideToMove}
        onSelect={handlePawnPromotion}
        onCancel={() => {
          promotionActions.hidePromotion();
          cancel();
        }}
      />
    </>
  );
};