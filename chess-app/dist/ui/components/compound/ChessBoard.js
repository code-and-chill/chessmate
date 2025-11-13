import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { boardTokens, colors } from '../../tokens';
export const ChessBoard = React.forwardRef(({ fen, sideToMove, myColor, isInteractive, onMove }, ref) => {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const squareSize = boardTokens.squareSize;
    const toAlgebraic = (file, rank) => {
        return String.fromCharCode(97 + file) + (rank + 1);
    };
    const isLightSquare = (file, rank) => {
        return (file + rank) % 2 === 0;
    };
    const handleSquarePress = async (file, rank) => {
        if (!isInteractive || sideToMove !== myColor) {
            return;
        }
        const algebraic = toAlgebraic(file, rank);
        if (!selectedSquare) {
            setSelectedSquare({ file, rank });
        }
        else {
            const fromAlgebraic = toAlgebraic(selectedSquare.file, selectedSquare.rank);
            try {
                await onMove(fromAlgebraic, algebraic);
                setSelectedSquare(null);
            }
            catch (err) {
                console.error('Move failed:', err);
            }
        }
    };
    return (_jsx(Box, { ref: ref, style: {
            width: boardTokens.size,
            height: boardTokens.size,
            borderRadius: boardTokens.borderRadius,
            overflow: 'hidden',
            backgroundColor: colors.appBackground,
        }, children: Array.from({ length: 8 }).map((_, rankIdx) => {
            const rank = myColor === 'w' ? 7 - rankIdx : rankIdx;
            return (_jsx(Box, { flexDirection: "row", children: Array.from({ length: 8 }).map((_, fileIdx) => {
                    const file = myColor === 'w' ? fileIdx : 7 - fileIdx;
                    const isLight = isLightSquare(file, rank);
                    const isSelected = selectedSquare?.file === file && selectedSquare?.rank === rank;
                    return (_jsx(Pressable, { onPress: () => handleSquarePress(file, rank), style: {
                            width: squareSize,
                            height: squareSize,
                            backgroundColor: isSelected
                                ? colors.accentGreenDark
                                : isLight
                                    ? colors.boardLight
                                    : colors.boardDark,
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: !isInteractive || sideToMove !== myColor ? 0.7 : 1,
                        }, children: _jsx(Text, { variant: "caption", color: "muted", children: toAlgebraic(file, rank) }) }, `${file}-${rank}`));
                }) }, rank));
        }) }));
});
ChessBoard.displayName = 'ChessBoard';
//# sourceMappingURL=ChessBoard.js.map