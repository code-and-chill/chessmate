import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { VStack } from '@/ui';

export default function LoginScreen() {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = t('auth.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.email_invalid');
    }
    
    if (!password) {
      newErrors.password = t('auth.password_required');
    } else if (password.length < 6) {
      newErrors.password = ti('auth.password_min_length', { min: 6 });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      router.back(); // Go back to previous screen after successful login
    } catch (error) {
      Alert.alert(t('auth.login_failed'), t('auth.invalid_credentials'));
    }
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardView, { backgroundColor: colors.background.primary }]}
      >
        <VStack style={styles.content} gap={6}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('auth.welcome_back')}</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('auth.sign_in_subtitle')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
            <VStack gap={4}>
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

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent.primary }, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>{isLoading ? t('auth.signing_in') : t('auth.sign_in')}</Text>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity onPress={() => Alert.alert(t('auth.forgot_password'), t('auth.forgot_password_coming_soon'))}>
                <Text style={[styles.linkText, { color: colors.accent.primary }]}>{t('auth.forgot_password')}</Text>
              </TouchableOpacity>
            </VStack>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.foreground.secondary }]}>{t('auth.dont_have_account')} </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.linkTextBold, { color: colors.accent.primary }]}>{t('auth.sign_up')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </VStack>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  linkText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
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
