import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useGame } from '../../hooks/useGame';

export const BotSelectionScreen: React.FC = () => {
  const { data: bots, isLoading } = useBotList();

  if (isLoading) {
    return <View style={styles.loading}><Text>Loading bots...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Bot</Text>
      {bots?.map((bot) => (
        <Button
          key={bot.id}
          title={`${bot.name} (${bot.difficulty})`}
          onPress={() => {/* Navigate to BotGameScreen */}}
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