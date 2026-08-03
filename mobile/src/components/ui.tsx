import { PropsWithChildren, ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function BodyText({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}

export function FieldLabel({ children, required }: PropsWithChildren<{ required?: boolean }>) {
  return (
    <Text style={styles.label}>
      {children}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.fieldError}>{message}</Text>;
}

type AppInputProps = TextInputProps & {
  error?: boolean;
};

export function AppInput({ error, onFocus, onBlur, style, ...props }: AppInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor="#94a3b8"
      {...props}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={[
        styles.input,
        focused ? styles.inputFocused : null,
        error ? styles.inputError : null,
        style,
      ]}
    />
  );
}

export function FormField({
  label,
  required,
  error,
  children,
  hint,
}: PropsWithChildren<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}>) {
  return (
    <View style={styles.field}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      <FieldError message={error} />
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        variant === 'ghost' && styles.buttonGhost,
        pressed && !isDisabled ? styles.buttonPressed : null,
        isDisabled ? styles.buttonDisabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.ink : colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            (variant === 'secondary' || variant === 'ghost') && styles.buttonTextDark,
            variant === 'danger' && styles.buttonTextLight,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'success' | 'danger' }) {
  return (
    <View
      style={[
        styles.badge,
        tone === 'accent' && styles.badgeAccent,
        tone === 'success' && styles.badgeSuccess,
        tone === 'danger' && styles.badgeDanger,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === 'accent' && styles.badgeTextAccent,
          tone === 'success' && styles.badgeTextSuccess,
          tone === 'danger' && styles.badgeTextDanger,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function MessageBanner({
  title,
  message,
  tone = 'error',
}: {
  title?: string;
  message: string;
  tone?: 'error' | 'success' | 'info' | 'warning';
}) {
  const defaultTitle =
    tone === 'success' ? 'Success' : tone === 'info' ? 'Info' : tone === 'warning' ? 'Check this' : 'Something went wrong';

  return (
    <View
      style={[
        styles.banner,
        tone === 'success' && styles.bannerSuccess,
        tone === 'info' && styles.bannerInfo,
        tone === 'warning' && styles.bannerWarning,
      ]}
    >
      <Text
        style={[
          styles.bannerTitle,
          tone === 'success' && styles.bannerTitleSuccess,
          tone === 'info' && styles.bannerTitleInfo,
          tone === 'warning' && styles.bannerTitleWarning,
        ]}
      >
        {title || defaultTitle}
      </Text>
      <Text
        style={[
          styles.bannerBody,
          tone === 'success' && styles.bannerBodySuccess,
          tone === 'info' && styles.bannerBodyInfo,
          tone === 'warning' && styles.bannerBodyWarning,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>∅</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{message}</Text>
      {action}
    </Card>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <Card style={styles.emptyCard}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.emptyBody}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    elevation: 2,
    gap: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  required: {
    color: colors.danger,
  },
  hint: {
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1.5,
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  button: {
    alignItems: 'center',
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonGhost: {
    backgroundColor: colors.surfaceMuted,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextDark: {
    color: colors.ink,
  },
  buttonTextLight: {
    color: colors.white,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSoft,
    borderRadius: radii.pill,
    borderWidth: 1,
    maxWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: colors.white,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeAccent: {
    backgroundColor: colors.accentSoft,
  },
  badgeSuccess: {
    backgroundColor: colors.successSoft,
  },
  badgeDanger: {
    backgroundColor: colors.dangerSoft,
  },
  badgeText: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextAccent: {
    color: colors.accent,
  },
  badgeTextSuccess: {
    color: colors.successText,
  },
  badgeTextDanger: {
    color: colors.dangerText,
  },
  banner: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
    padding: spacing.md,
  },
  bannerSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  bannerInfo: {
    backgroundColor: colors.infoSoft,
    borderColor: colors.infoBorder,
  },
  bannerWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningBorder,
  },
  bannerTitle: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '800',
  },
  bannerTitleSuccess: {
    color: colors.successText,
  },
  bannerTitleInfo: {
    color: colors.infoText,
  },
  bannerTitleWarning: {
    color: colors.warningText,
  },
  bannerBody: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 19,
  },
  bannerBodySuccess: {
    color: colors.successText,
  },
  bannerBodyInfo: {
    color: colors.infoText,
  },
  bannerBodyWarning: {
    color: colors.warningText,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emptyIconText: {
    color: colors.inkSoft,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyBody: {
    color: colors.inkMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
