import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme/colors';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>SS</Text>
      </View>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.title}>Secure Storage</Text>
      <Text style={styles.text}>Restoring your session...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: 24,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    height: 56,
    justifyContent: 'center',
    marginBottom: 8,
    width: 56,
  },
  markText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  text: {
    color: colors.inkMuted,
    fontSize: 14,
  },
});
