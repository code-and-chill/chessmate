import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from '../primitives/Text';
import { Box } from '../primitives/Box';
import { Surface } from '../primitives/Surface';
import { spacing, colors } from '../../tokens';
export const MoveList = React.forwardRef(({ moves }, ref) => {
    const moveGroups = [];
    for (const move of moves) {
        const moveNumber = move.moveNumber;
        let group = moveGroups.find(g => g.number === moveNumber);
        if (!group) {
            group = { number: moveNumber };
            moveGroups.push(group);
        }
        if (move.color === 'w') {
            group.white = move;
        }
        else {
            group.black = move;
        }
    }
    const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;
    return (_jsxs(Surface, { ref: ref, padding: "md", style: { maxHeight: 300, borderRadius: 12 }, children: [_jsxs(Text, { variant: "label", color: "primary", style: { marginBottom: spacing.md }, children: ["Moves (", moves.length, ")"] }), _jsxs(ScrollView, { children: [moveGroups.map(group => (_jsxs(Box, { flexDirection: "row", gap: "md", marginVertical: "xs", style: {
                            paddingVertical: spacing.xs,
                            borderRadius: 4,
                            backgroundColor: lastMove?.moveNumber === group.number
                                ? colors.accentGreen
                                : 'transparent',
                        }, children: [_jsxs(Text, { variant: "caption", color: "secondary", style: { minWidth: 30, fontWeight: '600' }, children: [group.number, "."] }), group.white && (_jsx(Text, { variant: "caption", color: "primary", children: group.white.san })), group.black && (_jsx(Text, { variant: "caption", color: "primary", children: group.black.san }))] }, group.number))), moves.length === 0 && (_jsx(Text, { variant: "caption", color: "muted", children: "No moves yet" }))] })] }));
});
MoveList.displayName = 'MoveList';
//# sourceMappingURL=MoveList.js.map