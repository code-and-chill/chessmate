import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { VStack } from '@/ui';

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
      router.back(); // Go back to previous screen after successful registration
    } catch (error: any) {
      Alert.alert(t('auth.registration_failed'), error.message || t('auth.try_again'));
    }
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardView, { backgroundColor: colors.background.primary }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <VStack style={styles.content} gap={6}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('auth.create_account')}</Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('auth.create_account_subtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
              <VStack gap={4}>
                {/* Username Input */}
                <View>
                  <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('auth.username')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }, errors.username && { borderColor: colors.error }]}
                    placeholder={t('auth.username').toLowerCase()}
                    placeholderTextColor={colors.foreground.muted}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) setErrors({ ...errors, username: undefined });
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.username && <Text style={[styles.errorText, { color: colors.error }]}>{errors.username}</Text>}
                </View>

                {/* Email Input */}
                <View>
                  <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('auth.email')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }, errors.email && { borderColor: colors.error }]}
                    placeholder={t('auth.email').toLowerCase()}
                    placeholderTextColor={colors.foreground.muted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
                </View>

                {/* Password Input */}
                <View>
                  <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('auth.password')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }, errors.password && { borderColor: colors.error }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.foreground.muted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
                </View>

                {/* Confirm Password Input */}
                <View>
                  <Text style={[styles.label, { color: colors.foreground.primary }]}>{t('auth.confirm_password')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background.secondary, borderColor: colors.background.tertiary, color: colors.foreground.primary }, errors.confirmPassword && { borderColor: colors.error }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.foreground.muted}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.confirmPassword && <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text>}
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.accent.primary }, isLoading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>{isLoading ? t('auth.creating_account') : t('auth.create_account')}</Text>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={[styles.termsText, { color: colors.foreground.muted }]}>
                  {t('auth.terms_agreement')}{' '}
                  <Text style={{ color: colors.accent.primary }}>{t('auth.terms_of_service')}</Text>
                  {' '}{t('auth.and')}{' '}
                  <Text style={{ color: colors.accent.primary }}>{t('auth.privacy_policy')}</Text>
                </Text>
              </VStack>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.foreground.secondary }]}>{t('auth.already_have_account')} </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.linkTextBold, { color: colors.accent.primary }]}>{t('auth.sign_in')}</Text>
              </TouchableOpacity>
          </Animated.View>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  linkTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
});
