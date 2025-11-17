import React from 'react';
import { View } from 'react-native';

export interface RatingStripProps {
  rating?: number;
}

export const RatingStrip: React.FC<RatingStripProps> = ({ rating = 1500 }) => (
  <View style={{ paddingVertical: 8 }}>
    {/* Rating strip placeholder */}
  </View>
);
