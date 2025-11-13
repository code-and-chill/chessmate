import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Surface } from '../primitives/Surface';
import { colors } from '../../tokens';
const formatClock = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
export const PlayerPanel = React.forwardRef(({ position, color, isSelf, remainingMs, accountId }, ref) => {
    return (_jsxs(Surface, { ref: ref, padding: "md", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: isSelf ? 'surfaceElevated' : 'surface', style: { minHeight: 60 }, children: [_jsxs(Box, { flex: 1, gap: "sm", children: [_jsxs(Text, { variant: "label", color: "secondary", children: [isSelf ? 'You' : 'Opponent', " (", color === 'w' ? 'White' : 'Black', ")"] }), _jsxs(Text, { variant: "caption", color: "muted", children: ["Account: ", accountId] })] }), _jsx(Box, { padding: "md", style: {
                    backgroundColor: colors.appBackground,
                    borderRadius: 8,
                    minWidth: 60,
                }, children: _jsx(Text, { variant: "heading", color: "primary", style: { textAlign: 'center' }, children: formatClock(remainingMs) }) })] }));
});
PlayerPanel.displayName = 'PlayerPanel';
//# sourceMappingURL=PlayerPanel.js.map