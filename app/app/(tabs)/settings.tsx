import { View, StyleSheet } from 'react-native';
import { SettingsScreen } from '@/features/settings';

export default function SettingsTab() {
  return (
    <View style={styles.container}>
      <SettingsScreen userId="current-user" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
