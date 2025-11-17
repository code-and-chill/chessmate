import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export const OnlinePlaySetupScreen: React.FC = () => {
  const { data: ratings, isLoading } = useRatings();

  if (isLoading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Time Control</Text>
      {ratings?.map((rating) => (
        <Button
          key={rating.type}
          title={`Play ${rating.type}`}
          onPress={() => {/* Navigate to MatchmakingScreen */}}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});