import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { VStack, Card, Input, Button, Text, Box, GlobalContainer } from '@/ui';
import { spacingTokens } from '@/ui/tokens/spacing';

export default function RegisterScreen() {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!username) {
      newErrors.username = t('auth.username_required');
    } else if (username.length < 3) {
      newErrors.username = ti('auth.username_min_length', { min: 3 });
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = t('auth.username_format');
    }
    
    if (!email) {
      newErrors.email = t('auth.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.email_invalid');
    }
    
    if (!password) {
      newErrors.password = t('auth.password_required');
    } else if (password.length < 8) {
      newErrors.password = ti('auth.password_min_length', { min: 8 });
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = t('auth.password_requirements');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirm_password_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwords_dont_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register(username, email, password);
      router.back();
    } catch (error: any) {
      Alert.alert(t('auth.registration_failed'), error.message || t('auth.try_again'));
    }
  };

  return (
    <GlobalContainer scrollable contentContainerStyle={styles.scrollContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <VStack gap={2} style={styles.header}>
              <Text
                variant="heading"
                weight="bold"
                style={[styles.title, { color: colors.accent.secondary }]}
              >
                {t('auth.create_account')}
              </Text>
              <Text
                variant="body"
                style={[styles.subtitle, { color: colors.foreground.secondary }]}
              >
                {t('auth.create_account_subtitle')}
              </Text>
            </VStack>
          </Animated.View>

          {/* Form Card - Using elevated variant like FeatureCard */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Card variant="elevated" size="lg" padding={6} animated>
              <VStack gap={5}>
                {/* Username Input */}
                <Input
                  label={t('auth.username')}
                  variant="default"
                  placeholder={t('auth.username').toLowerCase()}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.username}
                />

                {/* Email Input */}
                <Input
                  label={t('auth.email')}
                  variant="default"
                  placeholder={t('auth.email').toLowerCase()}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                />

                {/* Password Input */}
                <Input
                  label={t('auth.password')}
                  variant="default"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password}
                />

                {/* Confirm Password Input */}
                <Input
                  label={t('auth.confirm_password')}
                  variant="default"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.confirmPassword}
                />

                {/* Register Button with Glow */}
                <Button
                  variant="glow"
                  size="lg"
                  onPress={handleRegister}
                  disabled={isLoading}
                  isLoading={isLoading}
                  animated
                  style={styles.button}
                >
                  {isLoading ? t('auth.creating_account') : t('auth.create_account')}
                </Button>

                {/* Terms */}
                <Box margin={2}>
                  <Text variant="caption" color={colors.foreground.muted} style={styles.termsText}>
                    {t('auth.terms_agreement')}{' '}
                    <Text variant="caption" weight="semibold" color={colors.accent.secondary}>
                      {t('auth.terms_of_service')}
                    </Text>
                    {' '}{t('auth.and')}{' '}
                    <Text variant="caption" weight="semibold" color={colors.accent.secondary}>
                      {t('auth.privacy_policy')}
                    </Text>
                  </Text>
                </Box>
              </VStack>
            </Card>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Box flexDirection="row" justifyContent="center" alignItems="center" gap={2}>
              <Text variant="body" color={colors.foreground.secondary}>
                {t('auth.already_have_account')}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/login')}
              >
                <Text variant="body" weight="semibold" color={colors.accent.secondary}>
                  {t('auth.sign_in')}
                </Text>
              </Button>
            </Box>
          </Animated.View>
        </VStack>
      </KeyboardAvoidingView>
    </GlobalContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacingTokens[6],
    paddingVertical: spacingTokens[8],
  },
  content: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacingTokens[2],
  },
  title: {
    fontSize: 42,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: spacingTokens[2],
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
