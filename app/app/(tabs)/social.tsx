import { View, StyleSheet } from 'react-native';
import { SocialScreen } from '@/features/social';

/**
 * Social Tab - Integrated with account-api and rating-api services
 * 
 * This tab now uses the properly structured social feature with:
 * - Service integration (account-api for friends, rating-api for leaderboards)
 * - Proper separation of concerns (hooks, components, types)
 * - Mock data support for development
 * - Following the same pattern as Settings and Play tabs
 */
export default function SocialTab() {
  // TODO: Get userId from auth context
  const userId = 'current-user-id';

  return (
    <View style={styles.container}>
      <SocialScreen userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
