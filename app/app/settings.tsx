import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { VStack } from '@/ui';
import { Card } from '@/ui/primitives/Card';
import { useThemeTokens } from '@/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { user, logout } = useAuth();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [autoQueen, setAutoQueen] = useState(false);
  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [confirmMoves, setConfirmMoves] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const SettingRow = ({ label, value, onValueChange }: any) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.background.tertiary }]}>
      <Text style={[styles.settingLabel, { color: colors.foreground.primary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }}
        thumbColor={value ? colors.accentForeground.primary : colors.foreground.secondary}
      />
    </View>
  );

  const ActionButton = ({ label, onPress, variant = 'default' }: any) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary },
        variant === 'danger' && { backgroundColor: colors.error + '20', borderColor: colors.error },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.actionButtonText,
          { color: colors.foreground.primary },
          variant === 'danger' && { color: colors.error },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.accent.primary }]}>@{user?.username || 'Guest'}</Text>
          </Animated.View>

          {/* Profile Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Card variant="default" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Profile</Text>
                <ActionButton label="Edit Profile" onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')} />
                <ActionButton label="View Statistics" onPress={() => Alert.alert('Coming Soon', 'Statistics will be available soon')} />
                <ActionButton label="Rating History" onPress={() => Alert.alert('Coming Soon', 'Rating history will be available soon')} />
              </VStack>
            </Card>
          </Animated.View>

          {/* Game Settings */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Card variant="default" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Game Preferences</Text>
                <SettingRow
                  label="Show Legal Moves"
                  value={showLegalMoves}
                  onValueChange={setShowLegalMoves}
                />
                <SettingRow
                  label="Confirm Moves"
                  value={confirmMoves}
                  onValueChange={setConfirmMoves}
                />
                <SettingRow
                  label="Auto-Queen Promotion"
                  value={autoQueen}
                  onValueChange={setAutoQueen}
                />
              </VStack>
            </Card>
          </Animated.View>

          {/* Appearance */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Card variant="default" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Appearance</Text>
                <ActionButton label="Board Theme" onPress={() => Alert.alert('Coming Soon', 'Board themes will be available soon')} />
                <ActionButton label="Piece Style" onPress={() => Alert.alert('Coming Soon', 'Piece styles will be available soon')} />
                <ActionButton label="Theme Mode" onPress={() => Alert.alert('Coming Soon', 'Theme switching will be available soon')} />
              </VStack>
            </Card>
          </Animated.View>

          {/* Sound & Notifications */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <Card variant="default" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={styles.sectionTitle}>Sound & Notifications</Text>
                <SettingRow
                  label="Push Notifications"
                  value={notifications}
                  onValueChange={setNotifications}
                />
                <SettingRow
                  label="Sound Effects"
                  value={soundEffects}
                  onValueChange={setSoundEffects}
                />
                <SettingRow
                  label="Vibration"
                  value={vibration}
                  onValueChange={setVibration}
                />
              </VStack>
            </Card>
          </Animated.View>

          {/* Account Actions */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <Card variant="default" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Account</Text>
                <ActionButton label="Privacy Settings" onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon')} />
                <ActionButton label="Blocked Users" onPress={() => Alert.alert('Coming Soon', 'Block list will be available soon')} />
                <ActionButton label="Help & Support" onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon')} />
                <ActionButton
                  label="Logout"
                  variant="danger"
                  onPress={handleLogout}
                />
              </VStack>
            </Card>
          </Animated.View>

          {/* App Info */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)}>
            <Text style={[styles.appInfo, { color: colors.foreground.muted }]}>ChessMate v1.0.0</Text>
            <Text style={[styles.appInfo, { color: colors.foreground.muted }]}>© 2025 ChessMate. All rights reserved.</Text>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonDanger: {
    // Styles applied inline with theme colors
  },
  actionButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtonTextDanger: {
    // Styles applied inline with theme colors
  },
  appInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
