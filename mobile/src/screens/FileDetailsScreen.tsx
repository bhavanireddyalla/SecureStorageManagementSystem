import { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFileById, getPresignedUrl } from '../api/files';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  AppButton,
  Badge,
  Card,
  EmptyState,
  LoadingState,
  MessageBanner,
  SectionTitle,
} from '../components/ui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { StorageFile } from '../types/storage';
import { formatFileSize, getErrorMessage } from '../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'FileDetails'>;

const imagePreviewTypes = ['image/png', 'image/jpeg', 'image/gif'];
const previewableTypes = [...imagePreviewTypes, 'application/pdf'];

export function FileDetailsScreen({ route, navigation }: Props) {
  const { fileId } = route.params;
  const [file, setFile] = useState<StorageFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'preview' | 'download' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadFile = async () => {
      try {
        setErrorMessage('');
        setFile(await getFileById(fileId));
      } catch (error: any) {
        setErrorMessage(getErrorMessage(error, 'Unable to load file details.'));
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId]);

  const openSecureUrl = async (mode: 'preview' | 'download') => {
    try {
      setActionLoading(mode);
      setErrorMessage('');
      const response = await getPresignedUrl(fileId);

      if (!response?.url) {
        throw new Error('Secure file URL was not returned by the server.');
      }

      if (mode === 'preview' && file && imagePreviewTypes.includes(file.FileType)) {
        setPreviewUrl(response.url);
        return;
      }

      const canOpen = await Linking.canOpenURL(response.url);
      if (!canOpen) {
        throw new Error('Unable to open the secure file URL on this device.');
      }

      await Linking.openURL(response.url);
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error, `${mode} failed.`));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <ScreenLayout title="File Details" subtitle="Loading secure file metadata.">
        <LoadingState message="Loading file details..." />
      </ScreenLayout>
    );
  }

  if (!file) {
    return (
      <ScreenLayout title="File Details" subtitle="File unavailable." centerContent>
        <EmptyState
          action={<AppButton label="Go Back" onPress={() => navigation.goBack()} variant="secondary" />}
          message={errorMessage || 'The file could not be found.'}
          title="File unavailable"
        />
      </ScreenLayout>
    );
  }

  const canPreview = previewableTypes.includes(file.FileType);
  const canInlinePreview = imagePreviewTypes.includes(file.FileType);

  return (
    <ScreenLayout title="File Details" subtitle="Preview and download with a time-limited secure URL.">
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.fileName}>{file.OriginalName}</Text>
            <Badge label={file.FileType?.split('/').pop() || 'file'} tone="accent" />
          </View>
          <Text style={styles.meta}>Folder: {file.FolderId || 'Root'}</Text>
          <Text style={styles.meta}>Size: {formatFileSize(file.FileSize || 0)}</Text>
          <Text style={styles.meta}>Uploaded: {new Date(file.CreatedAt).toLocaleString()}</Text>
          {errorMessage ? <MessageBanner message={errorMessage} title="Action failed" /> : null}
          <View style={styles.row}>
            {canPreview ? (
              <AppButton
                label={canInlinePreview ? 'Preview Image' : 'Preview'}
                loading={actionLoading === 'preview'}
                onPress={() => openSecureUrl('preview')}
                style={styles.flexBtn}
                variant="secondary"
              />
            ) : null}
            <AppButton
              label="Download"
              loading={actionLoading === 'download'}
              onPress={() => openSecureUrl('download')}
              style={styles.flexBtn}
            />
          </View>
        </Card>

        {previewUrl ? (
          <Card>
            <SectionTitle>Secure image preview</SectionTitle>
            <Image resizeMode="contain" source={{ uri: previewUrl }} style={styles.previewImage} />
            <AppButton label="Hide Preview" onPress={() => setPreviewUrl(null)} variant="ghost" />
          </Card>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 28 },
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  fileName: { color: colors.ink, flex: 1, fontSize: 22, fontWeight: '800' },
  meta: { color: colors.inkMuted, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  flexBtn: { flexGrow: 1, minWidth: 120 },
  previewImage: {
    backgroundColor: colors.bgSoft,
    borderRadius: 12,
    height: 280,
    width: '100%',
  },
});
