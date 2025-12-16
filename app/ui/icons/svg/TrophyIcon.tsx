/**
 * Trophy Icon - SVG
 * Replaces 🏆 emoji
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface TrophyIconProps {
  size?: number;
  color?: string;
}

export const TrophyIcon: React.FC<TrophyIconProps> = ({ 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M6 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9M6 9h12M10 19v2M14 19v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};
