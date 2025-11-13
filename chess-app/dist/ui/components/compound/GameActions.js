import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Surface } from '../primitives/Surface';
import { spacing, colors } from '../../tokens';
export const GameActions = React.forwardRef(({ status, result, endReason, onResign }, ref) => {
    const isGameActive = status === 'in_progress';
    const isGameEnded = status === 'ended';
    return (_jsxs(Surface, { ref: ref, padding: "md", flexDirection: "row", gap: "md", justifyContent: "center", alignItems: "center", children: [isGameActive && (_jsx(Button, { variant: "danger", size: "md", onPress: onResign, children: "Resign" })), isGameEnded && result && (_jsxs(Box, { alignItems: "center", justifyContent: "center", padding: "md", style: {
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 8,
                    minWidth: 150,
                }, children: [_jsx(Text, { variant: "heading", color: "primary", children: result === '1-0' || result === '0-1' ? 'Game Over' : 'Draw' }), endReason && (_jsx(Text, { variant: "caption", color: "secondary", style: { marginTop: spacing.xs }, children: endReason }))] })), !isGameActive && !isGameEnded && (_jsx(Text, { variant: "caption", color: "muted", children: status === 'waiting_for_opponent'
                    ? 'Waiting for opponent...'
                    : 'Game preparing...' }))] }));
});
GameActions.displayName = 'GameActions';
//# sourceMappingURL=GameActions.js.map