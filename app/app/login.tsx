import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { VStack, Card, Input, Button, Text, Box, GlobalContainer } from '@/ui';
import { spacingTokens } from '@/ui/tokens/spacing';

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
      router.back();
    } catch (error) {
      Alert.alert(t('auth.login_failed'), t('auth.invalid_credentials'));
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
                style={[styles.title, { color: colors.accent.primary }]}
              >
                {t('auth.welcome_back')}
              </Text>
              <Text
                variant="body"
                style={[styles.subtitle, { color: colors.foreground.secondary }]}
              >
                {t('auth.sign_in_subtitle')}
              </Text>
            </VStack>
          </Animated.View>

          {/* Form Card - Using elevated variant like FeatureCard */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Card variant="elevated" size="lg" padding={6} animated>
              <VStack gap={5}>
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

                {/* Login Button with Glow */}
                <Button
                  variant="glow"
                  size="lg"
                  onPress={handleLogin}
                  disabled={isLoading}
                  isLoading={isLoading}
                  animated
                  style={styles.button}
                >
                  {isLoading ? t('auth.signing_in') : t('auth.sign_in')}
                </Button>

                {/* Forgot Password */}
                <Box alignItems="center" margin={2}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => Alert.alert(t('auth.forgot_password'), t('auth.forgot_password_coming_soon'))}
                  >
                    {t('auth.forgot_password')}
                  </Button>
                </Box>
              </VStack>
            </Card>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Box flexDirection="row" justifyContent="center" alignItems="center" gap={2}>
              <Text variant="body" color={colors.foreground.secondary}>
                {t('auth.dont_have_account')}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/register')}
              >
                <Text variant="body" weight="semibold" color={colors.accent.primary}>
                  {t('auth.sign_up')}
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
});
