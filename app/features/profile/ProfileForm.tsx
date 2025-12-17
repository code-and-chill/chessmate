
import { useState } from 'react';
import { VStack, Text, Button, Input, Avatar } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useApiClients } from '@/contexts/ApiContext';
import { useI18n } from '@/i18n/I18nContext';
import { useColors } from '@/ui/hooks/useThemeTokens';

export const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const { accountApi } = useApiClients();
  const { t } = useI18n();
  const colors = useColors();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await accountApi.updateProfile(user.id, {
        username: username.trim(),
        email: email.trim(),
      });
      setSuccess(true);
      // Optionally refresh user data from auth context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <VStack gap={4} alignItems="stretch" fullWidth>
      <Text variant="title">{t('profile.heading', 'Profile Information')}</Text>
      <VStack gap={2} alignItems="center">
        <Avatar name={username} />
      </VStack>
      <Input
        label={t('profile.usernameLabel', 'Username')}
        value={username}
        onChangeText={setUsername}
        placeholder={t('profile.usernamePlaceholder', 'Enter your username')}
        autoCapitalize="none"
      />
      <Input
        label={t('profile.emailLabel', 'Email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('profile.emailPlaceholder', 'Enter your email')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error && <Text variant="caption" color={colors.error}>{t('profile.error', error)}</Text>}
      {success && <Text variant="caption" color={colors.success}>{t('profile.success', 'Profile updated!')}</Text>}
      <Button onPress={handleSave} isLoading={saving}>
        {t('profile.saveButton', 'Save Changes')}
      </Button>
    </VStack>
  );
};
