import React from 'react';
import { View } from 'react-native';

export interface DailyPuzzleHeroProps {
  puzzle?: any;
}

export const DailyPuzzleHero: React.FC<DailyPuzzleHeroProps> = ({ puzzle }) => (
  <View style={{ paddingVertical: 8 }}>
    {/* Daily puzzle hero placeholder */}
  </View>
);
