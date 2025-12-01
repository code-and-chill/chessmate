import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';

export default function WatchTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watch & Streams</Text>
      <Text style={styles.subtitle}>Live games and streams coming soon</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL('https://www.chess.com/tv')}
      >
        <Text style={styles.buttonText}>Open ChessTV</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
