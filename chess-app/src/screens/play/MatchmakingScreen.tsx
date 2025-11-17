import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useNowPlaying } from '../../hooks/useNowPlaying';

export const MatchmakingScreen: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { enqueue, cancel } = useMatchmaking();

  const handlePlayNow = async () => {
    setIsSearching(true);
    try {
      await enqueue({ timeControl: 'blitz', rated: true });
      // Navigate to GameScreen when match is found
    } catch (error) {
      console.error('Matchmaking failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {isSearching ? (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Looking for an opponent...</Text>
          <Button title="Cancel" onPress={cancel} />
        </View>
      ) : (
        <Button title="Play Now" onPress={handlePlayNow} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});