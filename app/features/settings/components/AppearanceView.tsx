/**
 * Appearance View Component
 * features/settings/components/AppearanceView.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface AppearanceViewProps {
  onBack: () => void;
  userId: string;
}

export function AppearanceView({ onBack }: AppearanceViewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Appearance</Text>
      <Text style={styles.subtitle}>Personalize your interface</Text>

      {/* Theme */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.themeOptions}>
          <TouchableOpacity style={[styles.themeOption, styles.themeOptionActive]}>
            <Text style={styles.themeIcon}>☀️</Text>
            <Text style={styles.themeLabel}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeOption}>
            <Text style={styles.themeIcon}>🌙</Text>
            <Text style={styles.themeLabel}>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeOption}>
            <Text style={styles.themeIcon}>⚙️</Text>
            <Text style={styles.themeLabel}>Auto</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Display */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Display</Text>
        <PreferenceRow label="Language" value="English" />
        <PreferenceRow label="Time Format" value="12-hour" />
        <PreferenceRow label="Notation Style" value="Algebraic" />
        <PreferenceRow label="Font Size" value="Medium" />
      </View>

      {/* Accessibility */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <PreferenceRow label="High Contrast" value="Off" />
        <PreferenceRow label="Reduce Motion" value="Off" />
        <PreferenceRow label="Screen Reader" value="Off" />
        <PreferenceRow label="Large Text" value="Off" />
      </View>
    </ScrollView>
  );
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.preferenceRow}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Text style={styles.preferenceValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5856D6',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: '#5856D6',
    backgroundColor: '#EAE9FF',
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#000',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#5856D6',
    fontWeight: '600',
  },
});
