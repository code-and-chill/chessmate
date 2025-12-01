/**
 * White Bishop SVG Component
 * app/features/theme/components/pieces/WhiteBishop.tsx
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { PieceSvgProps } from '../../domain/models';

export const WhiteBishop: React.FC<PieceSvgProps> = ({ size, color = '#FFFFFF', opacity = 1 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 45 45" opacity={opacity}>
      {/* Top circle */}
      <Circle cx="22.5" cy="8" r="2.5" fill={color} stroke="#000" strokeWidth="1.5" />
      
      {/* Body */}
      <Path
        d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Mitre */}
      <Path
        d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Center line */}
      <Path
        d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8"
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
