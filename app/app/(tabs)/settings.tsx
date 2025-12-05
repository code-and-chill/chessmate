import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { SettingsScreen } from '@/features/settings';


export default function SettingsTab() {
  return (
    <SafeAreaView style={styles.container}>
      <SettingsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
