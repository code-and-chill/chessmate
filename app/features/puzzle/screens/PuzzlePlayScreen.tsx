import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { FadeInUp } from 'react-native-reanimated';
import { PawnPromotionModal, type PieceType } from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig } from '@/features/board/config';
import { moveToFen } from '@/core/utils/chess/logic/parsing';
import { ChessJsAdapter } from '@/core/utils/chess';
import { useReducedMotion } from '@/features/board/hooks/useReducedMotion';
import { useBoardLayout } from '@/features/board/hooks/useBoardLayout';
import { usePromotionModal } from '@/features/board/hooks/usePromotionModal';
import { Box } from '@/ui/primitives/Box';
import { VStack } from '@/ui/primitives/Stack';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { entranceAnimations } from '@/ui/animations/presets';
import type { Move } from '@/types/game';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { DevBadge } from '@/ui/primitives/DevBadge';
import { BoardColumn } from '@/features/board/components/BoardColumn';
import { MovesColumn } from '@/features/board/components/MovesColumn';
import { useApiClients } from '@/contexts/ApiContext';
import { ChessBoard } from '@/features/board';
import { Card } from '@/ui/primitives/Card';
import { usePuzzleAttempt } from '@/features/puzzle/hooks/usePuzzleAttempt';
import { Text } from '@/ui/primitives/Text';
import { useI18n } from '@/i18n/I18nContext';

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
  const { isHorizontalLayout, boardSize, squareSize, boardColumnFlex, movesColumnFlex, onLayout } = useBoardLayout();
  const api = useApiClients();
  const { t } = useI18n();

  const [loading, setLoading] = useState<boolean>(true);
  const [puzzle, setPuzzle] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [movesPlayed, setMovesPlayed] = useState<string[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<any | null>(null);

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

  const handleRateLimited = useCallback(() => {
    Alert.alert(t('rateLimited.title'), t('rateLimited.message'));
  }, [t]);

  // loadPuzzle will be defined as a stable callback so we can reference it from other callbacks
  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMovesPlayed([]);
    setRateLimitInfo(null);

    try {
      let env: any;
      // support daily mode: call getDailyPuzzle when requested
      if (daily && typeof (api.puzzleApi as any).getDailyPuzzle === 'function') {
        env = await (api.puzzleApi as any).getDailyPuzzle();
      } else {
        env = await (api.puzzleApi as any).getRandomPuzzle();
      }
      if (!env) {
        setError(t('errors.loadFailed'));
        setLoading(false);
        return;
      }

      // normalize envelope vs direct puzzle result
      const isEnvelope = typeof env === 'object' && ('ok' in env || 'status' in env || 'result' in env);
      if (isEnvelope && env.ok === false) {
        if (env.status === 429) {
          handleRateLimited();
          setLoading(false);
          return;
        }
        setError(env.error ?? t('errors.loadFailed'));
        setLoading(false);
        return;
      }

      const data = isEnvelope ? env.result ?? env : env;
      setPuzzle(data);

      const fen = data?.problem?.fen ?? data?.fen ?? puzzleState.fen;
      const side = data?.problem?.side_to_move ?? data?.problem?.sideToMove ?? data?.sideToMove ?? puzzleState.sideToMove;
      setPuzzleState(prev => ({ ...prev, fen, sideToMove: side, moves: [], status: 'in_progress', endReason: '' }));
      if ((env as any).rateLimit) setRateLimitInfo((env as any).rateLimit);
    } catch {
      setError(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [api.puzzleApi, t, puzzleState.fen, puzzleState.sideToMove, handleRateLimited, daily]);

  // onSolved should reload a new puzzle; keep stable reference
  const onSolvedCallback = useCallback(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  const { submitDebounced, guidance, rateLimit, cancel } = usePuzzleAttempt({
    puzzleId: puzzle?.id ?? '',
    debounceMs: 250,
    onSolved: onSolvedCallback,
    onRateLimited: handleRateLimited,
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

  const interactive = puzzleState.status === 'in_progress' && ((rateLimit?.remaining ?? rateLimitInfo?.remaining) ?? 1) > 0;

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

  const hidePlayerSection = daily || (puzzle?.problem?.show_player_section === false) || (puzzle?.problem?.showPlayerSection === false) || (puzzle?.show_player_section === false) || (puzzle?.showPlayerSection === false);

  return (
    <>
      {loading && (
        <Box padding={4}>
          <Text>{t('loading') ?? 'Loading...'}</Text>
        </Box>
      )}

      {!loading && error && (
        <Box padding={4}>
          <Text>{error}</Text>
        </Box>
      )}

      {!loading && !error && puzzle && (
        <Box style={{ flex: 1 }} onLayout={onLayout}>
          {hidePlayerSection ? (
            <Box flexDirection={isHorizontalLayout ? 'row' : 'column'} flex={1} gap={4}>
              <Box alignItems="center" style={{ width: isHorizontalLayout ? boardSize : '100%' }}>
                <Card variant="elevated" size="md" padding={0}>
                  {boardProps.fen ? <ChessBoard {...boardProps} size={boardSize} squareSize={squareSize} /> : null}
                </Card>
              </Box>
              <MovesColumn moves={puzzleState.moves} anim={createAnimConfig(100)} flex={movesColumnFlex} />
            </Box>
          ) : isHorizontalLayout ? (
            <Box flexDirection="row" flex={1} gap={4}>
              <BoardColumn
                boardSize={boardSize}
                squareSize={squareSize}
                boardProps={boardProps}
                gameState={{ fen: puzzleState.fen, sideToMove: puzzleState.sideToMove, status: puzzleState.status, endReason: puzzleState.endReason }}
                timerState={{ whiteTimeMs: 0, blackTimeMs: 0 }}
                onTimeExpire={() => {}}
                onResign={() => {}}
                onOfferDraw={() => {}}
                drawOfferPending={false}
                anim={createAnimConfig}
                isCompact={true}
                flex={boardColumnFlex}
              />

              <MovesColumn moves={puzzleState.moves} anim={createAnimConfig(100)} flex={movesColumnFlex} />
            </Box>
          ) : (
            <VStack flex={1} gap={4}>
              <BoardColumn
                boardSize={boardSize}
                squareSize={squareSize}
                boardProps={boardProps}
                gameState={{ fen: puzzleState.fen, sideToMove: puzzleState.sideToMove, status: puzzleState.status, endReason: puzzleState.endReason }}
                timerState={{ whiteTimeMs: 0, blackTimeMs: 0 }}
                onTimeExpire={() => {}}
                onResign={() => {}}
                onOfferDraw={() => {}}
                drawOfferPending={false}
                anim={createAnimConfig}
                isCompact={false}
                flex={boardColumnFlex}
              />

              <MovesColumn moves={puzzleState.moves} anim={createAnimConfig(100)} flex={movesColumnFlex} />
            </VStack>
          )}
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
            <Box>
              <Text>{`show_player_section: ${String(puzzle?.problem?.show_player_section)}`}</Text>
            </Box>
            {rateLimitInfo && (
              <Box>
                <Text>{`rate remaining: ${rateLimitInfo.remaining}`}</Text>
              </Box>
            )}
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