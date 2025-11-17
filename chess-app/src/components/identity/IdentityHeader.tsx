import React from 'react';
import { View } from 'react-native';

export interface IdentityHeaderProps {
  userId?: string;
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({ userId }) => (
  <View style={{ paddingVertical: 8 }}>
    {/* Identity header placeholder */}
  </View>
);
