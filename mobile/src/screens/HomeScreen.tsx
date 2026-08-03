import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDashboard } from '../api/dashboard';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  AppButton,
  Badge,
  BodyText,
  Card,
  EmptyState,
  LoadingState,
  MessageBanner,
  SectionTitle,
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { MainTabParamList, RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { StorageFile } from '../types/storage';
import { getErrorMessage } from '../utils/helpers';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type DashboardData = {
  totalUsers: number;
  totalFolders: number;
  totalFiles: number;
  recentFiles: StorageFile[];
};

export function DashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setErrorMessage('');
      setDashboard(await getDashboard());
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error, 'Unable to load dashboard.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  return (
    <ScreenLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || 'Admin'}.`}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} />}
      >
        <Card>
          <View style={styles.welcomeRow}>
            <View style={styles.flex}>
              <SectionTitle>Storage overview</SectionTitle>
              <BodyText>Live counts from the shared backend.</BodyText>
            </View>
            <Badge label="Admin" tone="accent" />
          </View>
        </Card>

        {errorMessage ? <MessageBanner message={errorMessage} title="Dashboard error" /> : null}

        {loading ? (
          <LoadingState message="Loading dashboard..." />
        ) : errorMessage && !dashboard ? (
          <EmptyState
            action={<AppButton label="Retry" onPress={() => loadDashboard()} />}
            message="Pull to refresh or tap retry."
            title="Dashboard unavailable"
          />
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Users</Text>
                <Text style={styles.summaryValue}>{dashboard?.totalUsers ?? 0}</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Folders</Text>
                <Text style={styles.summaryValue}>{dashboard?.totalFolders ?? 0}</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Files</Text>
                <Text style={styles.summaryValue}>{dashboard?.totalFiles ?? 0}</Text>
              </Card>
            </View>

            <Card>
              <SectionTitle>Quick actions</SectionTitle>
              <View style={styles.row}>
                <AppButton label="Files" onPress={() => navigation.navigate('Files')} style={styles.flexBtn} />
                <AppButton label="Folders" onPress={() => navigation.navigate('Folders')} style={styles.flexBtn} variant="secondary" />
                <AppButton label="Users" onPress={() => navigation.navigate('Users')} style={styles.flexBtn} variant="secondary" />
              </View>
            </Card>

            <Card>
              <SectionTitle>Recent files</SectionTitle>
              {dashboard?.recentFiles?.length ? (
                <View style={styles.list}>
                  {dashboard.recentFiles.map((file) => (
                    <View key={file.FileId} style={styles.recentItem}>
                      <View style={styles.flex}>
                        <Text style={styles.recentName} numberOfLines={1}>
                          {file.OriginalName}
                        </Text>
                        <Text style={styles.recentMeta}>{new Date(file.CreatedAt).toLocaleString()}</Text>
                      </View>
                      <AppButton
                        label="Open"
                        onPress={() => navigation.navigate('FileDetails', { fileId: file.FileId })}
                        variant="ghost"
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <BodyText>No recent files available.</BodyText>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 28 },
  welcomeRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  flex: { flex: 1, gap: 4 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: { alignItems: 'flex-start', flexGrow: 1, minWidth: '30%' },
  summaryLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  summaryValue: { color: colors.ink, fontSize: 28, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  flexBtn: { flexGrow: 1, minWidth: 96 },
  list: { gap: 10 },
  recentItem: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  recentName: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  recentMeta: { color: colors.inkMuted, fontSize: 12 },
});
