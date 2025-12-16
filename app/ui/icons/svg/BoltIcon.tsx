/**
 * Bolt Icon - SVG
 * Replaces ⚡ emoji
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface BoltIconProps {
  size?: number;
  color?: string;
}

export const BoltIcon: React.FC<BoltIconProps> = ({ 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
