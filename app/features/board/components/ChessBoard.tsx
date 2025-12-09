import React, {useEffect, useMemo, useState} from 'react';
import {AccessibilityInfo, StyleSheet, View} from 'react-native';
import {useThemeTokens} from '@/ui/hooks/useThemeTokens';
import {defaultBoardConfig} from '@/features/board/config';
import {type BoardTheme, getBoardColors} from '@/features/board/config/themeConfig';
import { PieceTheme } from '../types/pieces';
import {useBoardTheme} from '@/contexts/BoardThemeContext';
import {
    type Color,
    type Board as EngineBoard,
} from '@/core/utils/chess';
import {shadowTokens} from '@/ui/tokens/shadows';
import { Piece } from "@/features/board/components/Piece";
import {BoardGrid} from '@/features/board/components/BoardGrid';
import { useBoardController } from '@/features/board/hooks/useBoardController';
import {isLightSquare, fenToBoard} from "@/core/utils/chess/logic";

export type BoardConfig = {
    size?: number;
    squareSize?: number;
    borderRadius?: number;
    isInteractive?: boolean;
    disabledOpacity?: number;
};

export interface ChessBoardProps extends BoardConfig {
    fen?: string;
    sideToMove?: Color;
    myColor?: Color;
    boardTheme?: BoardTheme | any;
    pieceTheme?: PieceTheme;
    orientation?: 'white' | 'black';
    showLegalMoves?: boolean;
    showCoordinates?: boolean;
    animateMovements?: boolean;
    isLocalGame?: boolean;
    onMove?: (from: string, to: string, promotion?: string) => void | Promise<void>;
}

export const ChessBoard = React.forwardRef<View, ChessBoardProps>(
    ({
         size = defaultBoardConfig.size,
         squareSize: providedSquareSize,
         borderRadius = defaultBoardConfig.borderRadius,
         isInteractive = defaultBoardConfig.isInteractive,
         disabledOpacity = defaultBoardConfig.disabledOpacity,
         boardTheme: propBoardTheme,
         pieceTheme: propPieceTheme,
         orientation = 'white',
         sideToMove = 'w',
         myColor = 'w',
         fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
         isLocalGame = false,
         animateMovements = true,
         onMove,
     }, ref) => {
        const {boardTheme: contextBoardTheme, pieceTheme: contextPieceTheme} = useBoardTheme();
        // boardTheme may be a string key (BoardTheme) or an object with colors
        const finalPieceTheme = (propPieceTheme ?? contextPieceTheme) as PieceTheme | undefined;

        const [reduceMotion, setReduceMotion] = useState(false);

        // Check for reduced motion preference
        useEffect(() => {
            AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
                setReduceMotion(enabled);
            });
        }, []);

        // Parse the FEN to get the board state
        const board = useMemo<EngineBoard>(() => {
            return fenToBoard(fen) as EngineBoard;
        }, [fen]);

        const boardSize = size || 320;
        const squareSize = providedSquareSize || Math.floor(boardSize / 8);
        // Resolve theme colors: if propBoardTheme is an object with color keys, use it directly
        const themeColors = useMemo(() => {
            if (propBoardTheme && typeof propBoardTheme === 'object' && 'lightSquare' in propBoardTheme) {
                return propBoardTheme as any;
            }
            const key = (propBoardTheme as BoardTheme) || contextBoardTheme;
            return getBoardColors(key as BoardTheme);
        }, [propBoardTheme, contextBoardTheme]);
        const {colors} = useThemeTokens();

        const { selectedSquare, legalMoves, animatingPiece, handleSquarePress, isMyKingInCheck } = useBoardController({
             board,
             fen,
             sideToMove: sideToMove as Color,
             myColor: myColor as Color,
             isLocalGame,
             isInteractive,
             animateMovements,
             reduceMotion,
             onMove,
         });

        return (
            <View
                ref={ref}
                style={[
                    styles.board,
                    {
                        width: boardSize,
                        height: boardSize,
                        borderRadius: borderRadius,
                        backgroundColor: themeColors.background,
                        // Only dim the board when not interactive or when it's not the player's turn in non-local games
                        opacity: !isInteractive || (!isLocalGame && sideToMove !== myColor) ? disabledOpacity : 1,
                        position: 'relative',
                        overflow: 'hidden',
                    },
                ]}
            >
                <BoardGrid
                    board={board}
                    orientation={orientation}
                    squareSize={squareSize}
                    getSquareBackground={(file, rank) =>
                        isMyKingInCheck && board[rank][file]?.type === 'K' && board[rank][file]?.color === myColor
                            ? colors.error
                            : selectedSquare?.file === file && selectedSquare?.rank === rank
                                ? colors.accent.primary
                                : (isLightSquare(file, rank) ? themeColors.lightSquare : themeColors.darkSquare)
                    }
                    selectedSquare={selectedSquare}
                    legalMoves={legalMoves}
                    animatingPiece={animatingPiece}
                    isMyKingInCheck={isMyKingInCheck}
                    onSquarePress={handleSquarePress}
                    pieceTheme={finalPieceTheme}
                    checkColor={colors.error}
                    translucentDark={colors.translucent.dark}
                />

                {/* Animated piece overlay */}
                {animatingPiece && !reduceMotion && (
                    <Piece
                        piece={`${animatingPiece.piece.color}${animatingPiece.piece.type}` as any}
                        theme={finalPieceTheme ?? 'minimal'}
                        size={squareSize * 0.85}
                        color={animatingPiece.piece.color === 'w' ? '#f0f0f0' : '#2c2c2c'}
                        animation={{
                            fromFile: animatingPiece.fromFile,
                            fromRank: animatingPiece.fromRank,
                            toFile: animatingPiece.toFile,
                            toRank: animatingPiece.toRank,
                            squareSize,
                            orientation,
                            isOverlay: true,
                            isCapture: animatingPiece.isCapture,
                        }}
                    />
                )}
            </View>
        );
    }
);

ChessBoard.displayName = 'ChessBoard';

const styles = StyleSheet.create({
    board: {
        borderRadius: 4,
        ...shadowTokens.card,
    },
});

export default ChessBoard;
