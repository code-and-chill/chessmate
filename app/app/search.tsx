import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SearchModal() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'puzzles' | 'games' | 'users'>('puzzles');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.input}
        placeholder={`Search ${category}...`}
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />

      <View style={styles.segment}>
        {(['puzzles', 'games', 'users'] as const).map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.segmentButton, category === c ? styles.segmentActive : undefined]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.segmentText, category === c ? styles.segmentTextActive : undefined]}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.results}>
        <Text style={styles.hint}>Results will appear here (WIP)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#000' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, color: '#000' },
  segment: { flexDirection: 'row', marginTop: 12, marginBottom: 12 },
  segmentButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#f2f2f7', marginRight: 8 },
  segmentActive: { backgroundColor: '#0A84FF' },
  segmentText: { color: '#111' },
  segmentTextActive: { color: '#fff', fontWeight: '600' },
  results: { flex: 1, paddingTop: 12 },
  hint: { color: '#666' },
});
