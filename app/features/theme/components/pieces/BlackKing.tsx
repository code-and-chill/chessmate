/**
 * Black King SVG Component
 * app/features/theme/components/pieces/BlackKing.tsx
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { PieceSvgProps } from '../../domain/models';

export const BlackKing: React.FC<PieceSvgProps> = ({ size, color = '#000000', opacity = 1 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 45 45" opacity={opacity}>
      {/* Cross on top */}
      <Path
        d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Crown */}
      <Path
        d="M 9,26 C 17.5,24.5 27.5,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base */}
      <Path
        d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Highlight circles */}
      <Path
        d="M 11.5,30 C 15,29 30,29 33.5,30"
        stroke="#fff"
        strokeWidth="1"
        fill="none"
      />
      <Path
        d="M 12,33.5 C 18,32.5 27,32.5 33,33.5"
        stroke="#fff"
        strokeWidth="1"
        fill="none"
      />
      <Circle cx="22.5" cy="8" r="1.5" fill="#fff" />
    </Svg>
  );
};
