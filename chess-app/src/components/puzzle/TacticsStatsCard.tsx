import React from 'react';
import { View } from 'react-native';

export interface TacticsStatsCardProps {
  stats?: any;
}

export const TacticsStatsCard: React.FC<TacticsStatsCardProps> = ({ stats }) => (
  <View style={{ paddingVertical: 8 }}>
    {/* Tactics stats card placeholder */}
  </View>
);
