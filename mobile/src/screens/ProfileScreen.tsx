import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { AppButton, Badge, BodyText, Card, FieldLabel, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { colors, radii } from '../theme/colors';

export function ProfileScreen() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <ScreenLayout title="Profile" subtitle="Account details for your current secure session.">
      <View style={styles.content}>
        <Card>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.heroText}>
              <Text style={styles.name}>{user?.name || '-'}</Text>
              <Text style={styles.email}>{user?.email || '-'}</Text>
              <Badge label={user?.role || 'viewer'} tone={isAdmin ? 'accent' : 'neutral'} />
            </View>
          </View>
        </Card>

        <Card>
          <SectionTitle>Session details</SectionTitle>
          <FieldLabel>User ID</FieldLabel>
          <Text style={styles.value}>{user?.id || '-'}</Text>
          <FieldLabel>Access level</FieldLabel>
          <BodyText>
            {isAdmin
              ? 'Admin can manage folders, files, and user accounts.'
              : 'Viewer can browse, preview, and download files only.'}
          </BodyText>
          <AppButton label="Logout" onPress={logout} variant="danger" />
        </Card>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  hero: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroText: { flex: 1, gap: 6 },
  name: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  email: { color: colors.inkMuted, fontSize: 14 },
  value: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
