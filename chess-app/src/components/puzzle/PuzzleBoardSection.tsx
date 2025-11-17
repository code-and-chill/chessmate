import React from 'react';
import { View } from 'react-native';

export interface PuzzleBoardSectionProps {
  puzzle?: any;
  onMove?: (move: string) => void;
}

export const PuzzleBoardSection: React.FC<PuzzleBoardSectionProps> = ({ puzzle, onMove }) => (
  <View style={{ flex: 1, paddingVertical: 8 }}>
    {/* Puzzle board section placeholder */}
  </View>
);
