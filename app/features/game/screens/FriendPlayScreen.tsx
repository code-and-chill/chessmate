import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function FriendPlayScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Play with Friend</Text>
        <Text style={styles.subtitle}>Invite a friend or create a private game.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 8, color: '#666' },
});
