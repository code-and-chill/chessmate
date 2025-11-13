import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { ChessBoard } from '../components/compound/ChessBoard';
import { PlayerPanel } from '../components/compound/PlayerPanel';
import { GameActions } from '../components/compound/GameActions';
import { MoveList } from '../components/compound/MoveList';
import { useGame } from '../../core/hooks/useGame';
import { useAuth } from '../../core/hooks/useAuth';
import { colors, spacing } from '../tokens';
export const PlayScreen = React.forwardRef(({ gameId }, ref) => {
    const { token, currentAccountId, isAuthenticated } = useAuth();
    const { game, loading, error, makeMove, resign } = useGame(gameId, token || '', 'http://localhost:8001');
    if (!isAuthenticated) {
        return (_jsx(Box, { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "appBackground", children: _jsx(Text, { variant: "heading", color: "primary", children: "Please log in to play" }) }));
    }
    if (loading) {
        return (_jsx(Box, { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "appBackground", children: _jsx(ActivityIndicator, { size: "large", color: colors.accentGreen }) }));
    }
    if (error) {
        return (_jsxs(Box, { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "appBackground", padding: "lg", children: [_jsx(Text, { variant: "heading", color: "danger", children: "Error loading game" }), _jsx(Text, { variant: "body", color: "secondary", style: { marginTop: spacing.md }, children: error.message })] }));
    }
    if (!game || !currentAccountId) {
        return (_jsx(Box, { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "appBackground", children: _jsx(Text, { variant: "heading", color: "primary", children: "Game not found" }) }));
    }
    const myColor = game.white.accountId === currentAccountId
        ? 'w'
        : game.black.accountId === currentAccountId
            ? 'b'
            : null;
    if (!myColor) {
        return (_jsx(Box, { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "appBackground", children: _jsx(Text, { variant: "heading", color: "danger", children: "You are not a participant in this game" }) }));
    }
    const isInteractive = game.status === 'in_progress' && game.sideToMove === myColor;
    const opponentColor = myColor === 'w' ? 'b' : 'w';
    return (_jsxs(Box, { ref: ref, flex: 1, backgroundColor: "appBackground", flexDirection: "row", padding: "lg", gap: "lg", children: [_jsxs(Box, { flex: 1, flexDirection: "column", gap: "lg", children: [_jsx(PlayerPanel, { position: "top", color: opponentColor, isSelf: opponentColor === myColor, remainingMs: game[opponentColor === 'w' ? 'white' : 'black'].remainingMs, accountId: game[opponentColor === 'w' ? 'white' : 'black'].accountId }), _jsx(Box, { justifyContent: "center", alignItems: "center", children: _jsx(ChessBoard, { fen: game.fen, sideToMove: game.sideToMove, myColor: myColor, isInteractive: isInteractive, onMove: makeMove }) }), _jsx(PlayerPanel, { position: "bottom", color: myColor, isSelf: true, remainingMs: game[myColor === 'w' ? 'white' : 'black'].remainingMs, accountId: game[myColor === 'w' ? 'white' : 'black'].accountId }), _jsx(GameActions, { status: game.status, result: game.result, endReason: game.endReason, onResign: resign })] }), _jsxs(Box, { style: {
                    width: 200,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: spacing.md,
                }, children: [_jsx(Text, { variant: "label", color: "primary", children: "Moves" }), _jsx(MoveList, { moves: game.moves })] })] }));
});
PlayScreen.displayName = 'PlayScreen';
//# sourceMappingURL=PlayScreen.js.map