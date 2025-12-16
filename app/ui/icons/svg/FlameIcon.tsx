/**
 * Flame Icon - SVG
 * Replaces 🔥 emoji
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface FlameIconProps {
  size?: number;
  color?: string;
}

export const FlameIcon: React.FC<FlameIconProps> = ({ 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 14.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-1.5-1-2.5-1.5-3.5s-1-2-1-3c0-1.5 1-2.5 1.5-3.5.5-1 .5-2 0-3-.5-1-1.5-1.5-2.5-1.5s-2 1-2.5 2c-.5 1-.5 2 0 3 .5 1 1.5 2.5 1.5 4 0 1-1 2-1.5 3s-1.5 2-1.5 3.5z"
        fill={color}
      />
    </Svg>
  );
};
