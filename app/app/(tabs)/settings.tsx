import { View, StyleSheet } from 'react-native';
import { SettingsScreen } from '@/features/settings';

/**
 * Settings Tab - Integrated with account-api and rating-api services
 * 
 * This tab now uses the properly structured settings feature with:
 * - Service integration (account-api, rating-api)
 * - Proper separation of concerns (hooks, components, types)
 * - Mock data support for development
 * - Following the same pattern as the Play tab
 */
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
