/**
 * Happy Expression Icon - SVG
 * Replaces 😊 emoji
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export interface HappyIconProps {
  size?: number;
  color?: string;
}

export const HappyIcon: React.FC<HappyIconProps> = ({ 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="8" cy="9" r="1.5" fill={color} />
      <Circle cx="16" cy="9" r="1.5" fill={color} />
      <Path
        d="M8 14c0 2 1.5 4 4 4s4-2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};
