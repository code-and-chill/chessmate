/**
 * Celebration Icon - SVG
 * Replaces 🎉 emoji
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export interface CelebrationIconProps {
  size?: number;
  color?: string;
}

export const CelebrationIcon: React.FC<CelebrationIconProps> = ({ 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Party popper */}
      <Path
        d="M12 2v4M12 18v4M6 6l2.83 2.83M15.17 15.17L18 18M2 12h4M18 12h4M6 18l2.83-2.83M15.17 8.83L18 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Confetti dots */}
      <Circle cx="8" cy="4" r="1" fill={color} />
      <Circle cx="16" cy="4" r="1" fill={color} />
      <Circle cx="4" cy="8" r="1" fill={color} />
      <Circle cx="20" cy="8" r="1" fill={color} />
      <Circle cx="4" cy="16" r="1" fill={color} />
      <Circle cx="20" cy="16" r="1" fill={color} />
      <Circle cx="8" cy="20" r="1" fill={color} />
      <Circle cx="16" cy="20" r="1" fill={color} />
    </Svg>
  );
};
