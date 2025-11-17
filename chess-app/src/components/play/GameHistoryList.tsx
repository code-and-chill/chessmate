import React from 'react';
import { View } from 'react-native';

export interface GameHistoryListProps {
  games?: any[];
}

export const GameHistoryList: React.FC<GameHistoryListProps> = ({ games = [] }) => (
  <View style={{ paddingVertical: 8 }}>
    {/* Game history list placeholder */}
  </View>
);
