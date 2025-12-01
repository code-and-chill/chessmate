/**
 * Black Pawn SVG Component
 * app/features/theme/components/pieces/BlackPawn.tsx
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { PieceSvgProps } from '../../domain/models';

export const BlackPawn: React.FC<PieceSvgProps> = ({ size, color = '#000000', opacity = 1 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 45 45" opacity={opacity}>
      {/* Body */}
      <Path
        d="M 22.5,9 C 19.5,9 17,11.5 17,14.5 C 17,16.5 18,17.5 18,17.5 C 16,17 13,17.5 13,20.5 C 13,23.5 15,24.5 17,24.5 L 17,27 C 14,29 12,31.5 12,35.5 L 12,37.5 L 12,38.5 L 33,38.5 L 33,37.5 L 33,35.5 C 33,31.5 31,29 28,27 L 28,24.5 C 30,24.5 32,23.5 32,20.5 C 32,17.5 29,17 27,17.5 C 27,17.5 28,16.5 28,14.5 C 28,11.5 25.5,9 22.5,9 z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Highlight */}
      <Path
        d="M 18,17.5 C 18,17.5 16.5,17 14.5,19.5"
        stroke="#fff"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};
