/**
 * Profile View Component
 * features/settings/components/ProfileView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useUserProfile } from '../hooks';

export interface ProfileViewProps {
  onBack: () => void;
  userId: string;
}

/**
 * Profile editing view with live API integration
 */
export function ProfileView({ onBack, userId }: ProfileViewProps) {
  const { profile, loading, updateProfile } = useUserProfile(userId);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    country: '',
  });

  const handleSave = async () => {
    try {
      setEditing(true);
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setEditing(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5856D6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your chess profile</Text>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Text style={styles.avatarLarge}>{profile?.avatar || '♔'}</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Change Avatar</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Username</Text>
        <View style={styles.formInput}>
          <Text style={styles.formInputText}>{profile?.username}</Text>
        </View>

        <Text style={styles.formLabel}>Email</Text>
        <View style={styles.formInput}>
          <Text style={styles.formInputText}>{profile?.email}</Text>
        </View>

        <Text style={styles.formLabel}>Display Name</Text>
        <TextInput
          style={[styles.formInput, styles.formInputEditable]}
          placeholder="Enter display name"
          placeholderTextColor="#9CA3AF"
          value={formData.displayName || profile?.displayName || ''}
          onChangeText={(text) => setFormData({ ...formData, displayName: text })}
        />

        <Text style={styles.formLabel}>Bio</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea, styles.formInputEditable]}
          placeholder="Tell us about yourself"
          placeholderTextColor="#9CA3AF"
          value={formData.bio || profile?.bio || ''}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.formLabel}>Country</Text>
        <TextInput
          style={[styles.formInput, styles.formInputEditable]}
          placeholder="🇺🇸 United States"
          placeholderTextColor="#9CA3AF"
          value={formData.country || profile?.country || ''}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
        />

        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={handleSave}
          disabled={editing}
        >
          {editing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarLarge: {
    fontSize: 96,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#5856D6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formInputEditable: {
    borderColor: '#5856D6',
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formInputText: {
    fontSize: 16,
    color: '#000',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});
