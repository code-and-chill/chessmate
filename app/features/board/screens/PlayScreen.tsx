import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FadeInUp} from 'react-native-reanimated';
import {GameResultModal, PawnPromotionModal, type PieceType} from '@/features/game';
import {createPlayScreenConfig, getHydratedBoardProps} from '@/features/board/config';
import {useGameState, usePromotionModal, useGameTimer, usePositionAnalysis} from '@/features/board/hooks';
import {useReducedMotion} from '@/features/board/hooks/useReducedMotion';
import {Box} from '@/ui/primitives/Box';
import {VStack} from '@/ui/primitives/Stack';
import {useThemeTokens} from '@/ui/hooks/useThemeTokens';
import {spacingTokens} from '@/ui/tokens/spacing';
import {useBoardLayout} from '@/features/board/hooks/useBoardLayout';
import {BoardColumn} from '@/features/board/components/BoardColumn';
import {MovesColumn} from '@/features/board/components/MovesColumn';
import {useGameParticipant} from '@/features/game/hooks/useGameParticipant';
import {getPlayerColor} from '@/features/board/utils/getPlayerColor';
import {useAuth} from '@/contexts/AuthContext';
import {useBoardTheme} from '@/contexts/BoardThemeContext';
import {useBotMove} from '@/features/game/hooks/useBotMove';
import {useGameWebSocket} from '@/features/game/hooks/useGameWebSocket';
import {useMakeMove, useGetGame} from '@/features/game/hooks';
import {BotThinkingIndicator} from '@/features/board/components/BotThinkingIndicator';
import {EvalBar} from '@/ui/components/chess/EvalBar';

export interface PlayScreenProps {
    gameId?: string;
    initialGame?: Partial<import('../hooks/useGameState').GameState> | null;
}

export function PlayScreen({ gameId, initialGame }: PlayScreenProps = {}): React.ReactElement {
    const { colors } = useThemeTokens();
    const { boardTheme, pieceTheme } = useBoardTheme();
    const screenConfig = createPlayScreenConfig({
        theme: {
            boardTheme: boardTheme as any,
            pieceTheme: pieceTheme as any,
        } as any,
    });

    const [gameState, gameActions] = useGameState(initialGame ?? undefined);
    const gameStateRef = useRef(gameState);
    const {makeMove: makeLocalMove, endGame, offerDraw, updateFromApi} = gameActions;
    const auth = useAuth();
    
    // Use cases for API operations
    const { makeMove: makeApiMove, loading: moveLoading, error: moveError } = useMakeMove();
    const { game: apiGame, loading: gameLoading, refetch: refetchGame } = useGetGame(gameId ?? null);
    
    // Keep ref in sync with state
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);
    
    // Update local state when API game changes
    useEffect(() => {
        if (apiGame) {
            updateFromApi(apiGame);
        }
    }, [apiGame, updateFromApi]);
    
    // Bot game detection
    const isBotGame = !!(gameState.botId || gameState.isBotGame);
    const isBotTurn = isBotGame && gameState.botColor === gameState.sideToMove;
    
    // Handle bot moves - refresh game state when bot moves
    const handleGameUpdate = useCallback((updatedGame: any) => {
        if (updatedGame) {
            // Update local game state with the updated game
            updateFromApi(updatedGame);
        }
    }, [updateFromApi]);
    
    // WebSocket connection for real-time updates (with fallback to polling)
    const { connectionState: wsConnectionState, isConnected: wsConnected } = useGameWebSocket({
        gameId: gameId ?? null,
        authToken: auth?.token ?? '',
        enabled: !!gameId && !!auth?.token,
        onUpdate: (message) => {
            // When WebSocket receives updates, refetch full game state to ensure consistency
            if (message.type === 'move_played' || message.type === 'game_ended') {
                refetchGame();
            }
        },
    });
    
    // Use polling as fallback if WebSocket is not connected
    const usePollingFallback = !wsConnected && wsConnectionState !== 'connecting';
    
    const { isBotThinking, botThinkingTime } = useBotMove({
        gameId: gameId ?? null,
        gameState,
        isBotGame,
        isBotTurn,
        onGameUpdate: handleGameUpdate,
        enabled: usePollingFallback, // Only poll if WebSocket is not available
    });

    const participant = useGameParticipant(gameState as any, auth?.user?.id ?? null);
    const playerColor = getPlayerColor(participant);

    const [promotionState, promotionActions] = usePromotionModal();
    const [timerState, {handleTimeExpire}] = useGameTimer(endGame);

    const [showResultModal, setShowResultModal] = useState(false);
    const reduceMotion = useReducedMotion();
    
    // Position analysis - only for in-progress games
    const showAnalysis = gameState.status === 'in_progress';
    const positionAnalysis = usePositionAnalysis(
        showAnalysis ? gameState.fen : null,
        {
            maxDepth: 12,
            timeLimitMs: 1000,
            multiPv: 1,
            enabled: showAnalysis,
            debounceMs: 300,
        }
    );

    const {
        boardSize: BOARD_SIZE,
        squareSize: SQUARE_SIZE,
        isHorizontalLayout,
        boardColumnFlex,
        movesColumnFlex,
        onLayout,
    } = useBoardLayout();

    const handleMove = useCallback(
        async (from: string, to: string) => {
            const needsPromotion = promotionActions.checkPromotion(from, to, gameState.fen, gameState.sideToMove);
            if (needsPromotion) {
                promotionActions.showPromotion(from, to);
                return;
            }
            
            // For bot games, use API to make move (which will trigger bot move automatically)
            if (isBotGame && gameId) {
                try {
                    const updatedGame = await makeApiMove({ gameId, from, to });
                    // The API response includes both human and bot moves (if bot's turn)
                    // Update local game state with the API response
                    updateFromApi(updatedGame);
                } catch (error) {
                    console.error('Failed to make move:', error);
                }
            } else {
                // For local games, use local state
                makeLocalMove(from, to);
            }
        },
        [promotionActions, makeLocalMove, gameState.fen, gameState.sideToMove, isBotGame, gameId, makeApiMove, updateFromApi]
    );

    const boardProps = useMemo(() => {
        const rawPlayers = (gameState as any).players as string[] | undefined;
        const looksLikePlaceholderPlayers = Array.isArray(rawPlayers) && rawPlayers.length === 2 && rawPlayers.every(p => p.startsWith('Player'));
        const isLocal = (gameState as any).isLocal || (gameState as any).mode === 'local' || looksLikePlaceholderPlayers || !auth?.user?.id;
        const orientation = (isLocal ? (gameState.sideToMove === 'w' ? 'white' : 'black') : (playerColor === 'w' ? 'white' : 'black')) as 'white' | 'black';
        const myColor = (isLocal ? (gameState.sideToMove as any) : playerColor) as 'white' | 'black';

        return {
            ...getHydratedBoardProps(screenConfig),
            fen: gameState.fen,
            sideToMove: gameState.sideToMove,
            myColor,
            orientation,
            isLocalGame: isLocal,
            lastMove: gameState.lastMove,
            isInteractive: gameState.status === 'in_progress' && !isBotTurn && !isBotThinking,
            onMove: handleMove,
        };
    }, [gameState, auth?.user?.id, playerColor, screenConfig, handleMove, isBotTurn, isBotThinking]);

    const handlePawnPromotion = useCallback(
        async (piece: PieceType) => {
            if (!promotionState.move) return;
            const {from, to} = promotionState.move;
            
            // For bot games, use API
            if (isBotGame && gameId) {
                try {
                    const updatedGame = await makeApiMove({ gameId, from, to, promotion: piece });
                    updateFromApi(updatedGame);
                    promotionActions.hidePromotion();
                } catch (error) {
                    console.error('Failed to make promotion move:', error);
                }
            } else {
                makeLocalMove(from, to, piece);
                promotionActions.hidePromotion();
            }
        },
        [promotionState.move, makeLocalMove, promotionActions, isBotGame, gameId, makeApiMove, updateFromApi]
    );

    const handleResign = useCallback(() => {
        const winner = gameState.sideToMove === 'w' ? '0-1' : '1-0';
        const resigningPlayer = gameState.sideToMove === 'w' ? 'White' : 'Black';
        endGame(winner, `${resigningPlayer} resigned`);
    }, [gameState.sideToMove, endGame]);

    const handleOfferDraw = useCallback(() => offerDraw(), [offerDraw]);

    const createAnimConfig = useCallback((delay: number) => (reduceMotion ? undefined : FadeInUp.duration(250).delay(delay)), [
        reduceMotion,
    ]);

    useEffect(() => setShowResultModal(gameState.status === 'ended' && !!gameState.result), [gameState.status, gameState.result]);

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background.primary}]}>
            <View style={styles.container} onLayout={onLayout}>
                {isHorizontalLayout ? (
                    <Box style={{ flexDirection: 'row', flex: 1, gap: spacingTokens[2], alignItems: 'stretch' }}>
                        <BoardColumn
                            boardSize={BOARD_SIZE}
                            squareSize={SQUARE_SIZE}
                            boardProps={boardProps}
                            gameState={gameState as any}
                            timerState={timerState}
                            onTimeExpire={handleTimeExpire}
                            onResign={handleResign}
                            onOfferDraw={handleOfferDraw}
                            drawOfferPending={gameState.offerPending ?? false}
                            anim={createAnimConfig}
                            isCompact={true}
                            flex={boardColumnFlex}
                            evaluation={positionAnalysis.evaluation}
                            showEvaluation={showAnalysis}
                        />

                        <MovesColumn moves={gameState.moves} anim={createAnimConfig(100)} flex={movesColumnFlex} />
                    </Box>
                ) : (
                    <VStack flex={1} gap={spacingTokens[2]}>
                        <BoardColumn
                            boardSize={BOARD_SIZE}
                            squareSize={SQUARE_SIZE}
                            boardProps={boardProps}
                            gameState={gameState as any}
                            timerState={timerState}
                            onTimeExpire={handleTimeExpire}
                            onResign={handleResign}
                            onOfferDraw={handleOfferDraw}
                            drawOfferPending={gameState.offerPending ?? false}
                            anim={createAnimConfig}
                            isCompact={false}
                            flex={boardColumnFlex}
                            evaluation={positionAnalysis.evaluation}
                            showEvaluation={showAnalysis}
                        />

                        <MovesColumn moves={gameState.moves} anim={createAnimConfig(100)} flex={movesColumnFlex} />
                    </VStack>
                )}

                <PawnPromotionModal visible={promotionState.isVisible} color={gameState.sideToMove}
                                    onSelect={handlePawnPromotion} onCancel={promotionActions.hidePromotion}/>

                {gameState.result && (
                    <GameResultModal visible={showResultModal} result={gameState.result} reason={gameState.endReason}
                                     isPlayerWhite={playerColor === 'w'} onClose={() => setShowResultModal(false)}/>
                )}

                <BotThinkingIndicator visible={isBotThinking} thinkingTime={botThinkingTime} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
});
