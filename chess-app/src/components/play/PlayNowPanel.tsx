import React from 'react';
import { View } from 'react-native';

export interface NowPlayingBannerProps {
  gameId?: string;
}

export const NowPlayingBanner: React.FC<NowPlayingBannerProps> = ({ gameId }) => (
  <View style={{ paddingVertical: 8 }}>
    {/* Now playing banner placeholder */}
  </View>
);
