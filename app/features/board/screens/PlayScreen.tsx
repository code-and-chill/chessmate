import {useState, useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FadeInUp} from 'react-native-reanimated';
import {GameResultModal, PawnPromotionModal, type PieceType} from '@/features/game';
import {createPlayScreenConfig, getHydratedBoardProps} from '@/features/board/config';
import {useGameState, usePromotionModal, useGameTimer} from '@/features/board/hooks';
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

export interface PlayScreenProps {
    gameId?: string;
    initialGame?: Partial<import('../hooks/useGameState').GameState> | null;
}

export function PlayScreen({ initialGame }: PlayScreenProps = {}): React.ReactElement {
    const { colors } = useThemeTokens();
    const { boardTheme, pieceTheme } = useBoardTheme();
    const screenConfig = createPlayScreenConfig({
        theme: {
            boardTheme: boardTheme as any,
            pieceTheme: pieceTheme as any,
        } as any,
    });

    const [gameState, gameActions] = useGameState(initialGame ?? undefined);
    const {makeMove, endGame, offerDraw} = gameActions;
    const auth = useAuth();

    const participant = useGameParticipant(gameState as any, auth?.user?.id ?? null);
    const playerColor = getPlayerColor(participant);

    const [promotionState, promotionActions] = usePromotionModal();
    const [timerState, {handleTimeExpire}] = useGameTimer(endGame);

    const [showResultModal, setShowResultModal] = useState(false);
    const reduceMotion = useReducedMotion();

    const {
        boardSize: BOARD_SIZE,
        squareSize: SQUARE_SIZE,
        isHorizontalLayout,
        boardColumnFlex,
        movesColumnFlex,
        onLayout,
    } = useBoardLayout();

    const handleMove = useCallback(
        (from: string, to: string) => {
            const needsPromotion = promotionActions.checkPromotion(from, to, gameState.fen, gameState.sideToMove);
            if (needsPromotion) {
                promotionActions.showPromotion(from, to);
                return;
            }
            makeMove(from, to);
        },
        [promotionActions, makeMove, gameState.fen, gameState.sideToMove]
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
            isInteractive: gameState.status === 'in_progress',
            onMove: handleMove,
        };
    }, [gameState, auth?.user?.id, playerColor, screenConfig, handleMove]);

    const handlePawnPromotion = useCallback(
        (piece: PieceType) => {
            if (!promotionState.move) return;
            const {from, to} = promotionState.move;
            makeMove(from, to, piece);
            promotionActions.hidePromotion();
        },
        [promotionState.move, makeMove, promotionActions]
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
});
