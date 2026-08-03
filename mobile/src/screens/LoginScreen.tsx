import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loginUser } from '../api/auth';
import { ScreenLayout } from '../components/ScreenLayout';
import { AppButton, AppInput, Card, FormField, MessageBanner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { colors, radii } from '../theme/colors';
import { getErrorMessage, validateEmail, validatePassword } from '../utils/helpers';

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<FieldErrors>({});

  const validate = () => {
    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password, { minLength: 1 }),
    };

    setFieldErrors(nextErrors);
    setTouched({ email: '1', password: '1' });
    return !nextErrors.email && !nextErrors.password;
  };

  const handleLogin = async () => {
    setErrorMessage('');

    if (!validate()) {
      setErrorMessage('Please fix the highlighted fields and try again.');
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({
        email: email.trim(),
        password,
      });
      await login(response);
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error, 'Login failed. Check your email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout hideHeader centerContent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.heroPanel}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>SS</Text>
            </View>
            <Text style={styles.brand}>Secure Storage</Text>
            <Text style={styles.headline}>Sign in to your workspace</Text>
            <Text style={styles.heroBody}>Access private folders and files with role-based permissions.</Text>
          </View>

          <Card>
            <FormField error={touched.email ? fieldErrors.email : ''} label="Email" required>
              <AppInput
                autoCapitalize="none"
                autoCorrect={false}
                error={Boolean(touched.email && fieldErrors.email)}
                keyboardType="email-address"
                onBlur={() => {
                  setTouched((current) => ({ ...current, email: '1' }));
                  setFieldErrors((current) => ({ ...current, email: validateEmail(email) }));
                }}
                onChangeText={(value) => {
                  setEmail(value);
                  if (touched.email) {
                    setFieldErrors((current) => ({ ...current, email: validateEmail(value) }));
                  }
                }}
                placeholder="you@company.com"
                value={email}
              />
            </FormField>

            <FormField error={touched.password ? fieldErrors.password : ''} label="Password" required>
              <AppInput
                error={Boolean(touched.password && fieldErrors.password)}
                onBlur={() => {
                  setTouched((current) => ({ ...current, password: '1' }));
                  setFieldErrors((current) => ({
                    ...current,
                    password: validatePassword(password, { minLength: 1 }),
                  }));
                }}
                onChangeText={(value) => {
                  setPassword(value);
                  if (touched.password) {
                    setFieldErrors((current) => ({
                      ...current,
                      password: validatePassword(value, { minLength: 1 }),
                    }));
                  }
                }}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
              />
            </FormField>

            {errorMessage ? <MessageBanner message={errorMessage} title="Sign-in failed" /> : null}
            <AppButton label="Sign In" loading={loading} onPress={handleLogin} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', gap: 18, paddingVertical: 24 },
  heroPanel: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    gap: 10,
    padding: 22,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    marginBottom: 4,
    width: 42,
  },
  brandMarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  brand: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroBody: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
  },
});
