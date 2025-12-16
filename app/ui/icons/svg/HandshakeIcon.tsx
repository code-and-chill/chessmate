/**
 * Handshake Icon - SVG
 * Replaces 🤝 emoji
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface HandshakeIconProps {
  size?: number;
  color?: string;
}

export const HandshakeIcon: React.FC<HandshakeIconProps> = ({ 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 12h2M9 10h2M7 8h2M15 8h2M13 10h2M11 12h2M9 14h6M7 16h10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 12h14M3 14h18M1 16h22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
