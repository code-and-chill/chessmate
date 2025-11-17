import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IdentityHeader } from '../../components/identity/IdentityHeader';
import { RatingStrip } from '../../components/play/RatingStrip';
import { NowPlayingBanner } from '../../components/play/NowPlayingBanner';
import { PlayNowPanel } from '../../components/play/PlayNowPanel';
import { GameHistoryList } from '../../components/play/GameHistoryList';

export const PlayHubScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <IdentityHeader />
      <RatingStrip />
      <NowPlayingBanner />
      <PlayNowPanel />
      <GameHistoryList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
});