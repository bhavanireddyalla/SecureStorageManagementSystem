import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';

type ScreenLayoutProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  centerContent?: boolean;
  hideHeader?: boolean;
}>;

export function ScreenLayout({
  children,
  title,
  subtitle,
  footer,
  centerContent = false,
  hideHeader = false,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {!hideHeader && (title || subtitle) ? (
          <View style={styles.header}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        <View style={[styles.content, centerContent ? styles.contentCentered : null]}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  container: {
    backgroundColor: colors.bg,
    flex: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    gap: 4,
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  contentCentered: {
    justifyContent: 'center',
  },
  footer: {
    marginTop: spacing.md,
  },
});
