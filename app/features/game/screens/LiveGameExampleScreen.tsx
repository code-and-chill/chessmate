import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function LiveGameExampleScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Live Game Example</Text>
        <Text style={styles.subtitle}>Example live game UI moved into feature slice.</Text>
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
