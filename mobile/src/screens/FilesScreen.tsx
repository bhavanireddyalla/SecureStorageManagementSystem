import DocumentPicker, {isCancel} from 'react-native-document-picker';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteFile, getFiles, moveFile, searchFiles, updateFile, uploadFile } from '../api/files';
import { getFolderTree } from '../api/folders';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  AppButton,
  AppInput,
  Badge,
  BodyText,
  Card,
  Chip,
  EmptyState,
  FormField,
  LoadingState,
  MessageBanner,
  SectionTitle,
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { MainTabParamList, RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { FileSort, StorageFile, StorageFolder } from '../types/storage';
import {
  ALLOWED_UPLOAD_TYPES,
  formatFileSize,
  getErrorMessage,
  guessMimeType,
  validateItemName,
  validateUploadFile,
} from '../utils/helpers';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Files'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type UploadAsset = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export function FilesScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [folderTree, setFolderTree] = useState<StorageFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<FileSort>('date');
  const [uploadAsset, setUploadAsset] = useState<UploadAsset | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [submittingUpload, setSubmittingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeManageFileId, setActiveManageFileId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<number | null>(null);
  const [actingOnFileId, setActingOnFileId] = useState<number | null>(null);

  const folderOptions = useMemo(() => {
    const flatten = (nodes: StorageFolder[], prefix = ''): Array<{ id: number; label: string }> =>
      nodes.flatMap((folder) => [
        { id: folder.FolderId, label: `${prefix}${folder.FolderName}` },
        ...flatten(folder.children || [], `${prefix}• `),
      ]);

    return flatten(folderTree);
  }, [folderTree]);

  const loadFolders = async () => {
    const tree = await getFolderTree();
    setFolderTree(tree);
    if (tree.length && uploadFolderId === null) {
      setUploadFolderId(tree[0].FolderId);
    }
  };

  const loadFiles = async (currentSearch = searchTerm, currentFolderId = selectedFolderId, currentSort = sortBy) => {
    if (currentSearch.trim()) {
      setFiles(await searchFiles(currentSearch.trim()));
      return;
    }

    setFiles(await getFiles(currentSort, currentFolderId));
  };

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setMessage(null);
      await Promise.all([loadFolders(), loadFiles()]);
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to load files.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      return;
    }

    loadFiles()
      .catch((error: any) => setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to load files.') }))
      .finally(() => setLoading(false));
  }, [selectedFolderId, sortBy]);

  const handleSearch = async () => {
    if (searchTerm.trim() && searchTerm.trim().length < 2) {
      setSearchError('Enter at least 2 characters to search.');
      return;
    }

    setSearchError('');
    setLoading(true);
    try {
      setMessage(null);
      await loadFiles(searchTerm);
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Search failed.') });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setSearchTerm('');
    setSearchError('');
    setSelectedFolderId(null);
    setSortBy('date');
    setLoading(true);
    try {
      setMessage(null);
      await Promise.all([loadFolders(), getFiles('date', null).then(setFiles)]);
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to reset filters.') });
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    try {
      const asset = await DocumentPicker.pickSingle({
        copyTo: 'cachesDirectory',
        type: ALLOWED_UPLOAD_TYPES,
      });

      const fileUri = asset.fileCopyUri || asset.uri;
      const mimeType = guessMimeType(asset.name || 'file', asset.type || undefined);
      const nextFile = {
        uri: fileUri,
        name: asset.name || 'upload.bin',
        mimeType,
        size: asset.size ?? undefined,
      };

      const validationError = validateUploadFile(nextFile, uploadFolderId || folderOptions[0]?.id || null);
      if (validationError && validationError.includes('file type')) {
        setUploadAsset(null);
        setUploadError(validationError);
        return;
      }

      if ((asset.size || 0) > 10 * 1024 * 1024) {
        setUploadAsset(null);
        setUploadError('File must be smaller than 10MB.');
        return;
      }

      setUploadAsset(nextFile);
      setUploadError('');
      setMessage(null);
    } catch (error: any) {
      if (isCancel(error)) {
        return;
      }
      setUploadError(getErrorMessage(error, 'Unable to open document picker.'));
    }
  };

  const handleUpload = async () => {
    const validationError = validateUploadFile(uploadAsset, uploadFolderId);
    if (validationError) {
      setUploadError(validationError);
      setMessage({ tone: 'warning', text: validationError });
      return;
    }

    try {
      setSubmittingUpload(true);
      setUploadProgress(0);
      setUploadError('');
      setMessage(null);

      const formData = new FormData();
      formData.append('folderId', String(uploadFolderId));
      formData.append('file', {
        uri: uploadAsset!.uri,
        name: uploadAsset!.name,
        type: uploadAsset!.mimeType,
      } as any);

      await uploadFile(formData, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        } else if (progressEvent.loaded > 0) {
          setUploadProgress((current) => Math.min(current + 10, 90));
        }
      });

      setUploadAsset(null);
      setUploadProgress(100);
      setMessage({ tone: 'success', text: 'File uploaded successfully.' });
      await loadData();
    } catch (error: any) {
      const text = getErrorMessage(error, 'Upload failed.');
      setUploadError(text);
      setMessage({ tone: 'error', text });
    } finally {
      setSubmittingUpload(false);
    }
  };

  const startManage = (file: StorageFile) => {
    setActiveManageFileId(file.FileId);
    setRenameValue(file.OriginalName);
    setRenameError('');
    setMoveTargetFolderId(file.FolderId ?? null);
  };

  const handleRename = async (fileId: number) => {
    const error = validateItemName(renameValue, 'File name');
    if (error) {
      setRenameError(error);
      return;
    }

    try {
      setActingOnFileId(fileId);
      await updateFile(fileId, renameValue.trim());
      setActiveManageFileId(null);
      setMessage({ tone: 'success', text: 'File renamed successfully.' });
      await loadFiles();
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Rename failed.') });
    } finally {
      setActingOnFileId(null);
    }
  };

  const handleMove = async (fileId: number) => {
    try {
      setActingOnFileId(fileId);
      await moveFile(fileId, moveTargetFolderId);
      setActiveManageFileId(null);
      setMessage({ tone: 'success', text: 'File moved successfully.' });
      await loadFiles();
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Move failed.') });
    } finally {
      setActingOnFileId(null);
    }
  };

  const confirmDelete = (file: StorageFile) => {
    Alert.alert('Delete file', `Delete "${file.OriginalName}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setActingOnFileId(file.FileId);
            await deleteFile(file.FileId);
            setMessage({ tone: 'success', text: 'File deleted successfully.' });
            await loadFiles();
          } catch (error: any) {
            setMessage({ tone: 'error', text: getErrorMessage(error, 'Delete failed.') });
          } finally {
            setActingOnFileId(null);
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout title="Files" subtitle="Browse, upload, and manage secure documents.">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        <Card>
          <View style={styles.headerRow}>
            <View style={styles.flex}>
              <SectionTitle>Workspace</SectionTitle>
              <BodyText>
                {user?.name} · {isAdmin ? 'Admin access' : 'Viewer access'}
              </BodyText>
            </View>
            <Badge label={user?.role || 'viewer'} tone={isAdmin ? 'accent' : 'neutral'} />
          </View>
        </Card>

        <Card>
          <SectionTitle>Search & filters</SectionTitle>
          <FormField error={searchError} hint="Search matches file names from the secure backend." label="Search files">
            <AppInput
              autoCapitalize="none"
              autoCorrect={false}
              error={Boolean(searchError)}
              onChangeText={(value) => {
                setSearchTerm(value);
                if (searchError) {
                  setSearchError(value.trim() && value.trim().length < 2 ? 'Enter at least 2 characters to search.' : '');
                }
              }}
              placeholder="Search by file name"
              value={searchTerm}
            />
          </FormField>
          <View style={styles.row}>
            <AppButton label="Search" onPress={handleSearch} style={styles.flexBtn} />
            <AppButton label="Reset" onPress={handleReset} style={styles.flexBtn} variant="secondary" />
          </View>
          <Text style={styles.softLabel}>Sort by</Text>
          <View style={styles.rowWrap}>
            {(['date', 'name', 'size'] as FileSort[]).map((option) => (
              <Chip key={option} active={sortBy === option} label={option} onPress={() => setSortBy(option)} />
            ))}
          </View>
          <Text style={styles.softLabel}>Folder</Text>
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <Chip active={selectedFolderId === null} label="All folders" onPress={() => setSelectedFolderId(null)} />
            {folderOptions.map((folder) => (
              <Chip
                key={folder.id}
                active={selectedFolderId === folder.id}
                label={folder.label}
                onPress={() => setSelectedFolderId(folder.id)}
              />
            ))}
          </ScrollView>
        </Card>

        {isAdmin ? (
          <Card>
            <SectionTitle>Upload file</SectionTitle>
            <BodyText>Allowed: JPEG, PNG, PDF, DOC, DOCX · Max 10MB</BodyText>
            <AppButton
              label={uploadAsset ? uploadAsset.name : 'Choose File'}
              onPress={pickFile}
              variant="secondary"
            />
            <FormField
              error={uploadError}
              hint={folderOptions.length ? 'Select where this file should be stored.' : undefined}
              label="Destination folder"
              required
            >
              {folderOptions.length ? (
                <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {folderOptions.map((folder) => (
                    <Chip
                      key={folder.id}
                      active={uploadFolderId === folder.id}
                      label={folder.label}
                      onPress={() => {
                        setUploadFolderId(folder.id);
                        if (uploadError.includes('folder')) {
                          setUploadError('');
                        }
                      }}
                    />
                  ))}
                </ScrollView>
              ) : (
                <MessageBanner message="No folders yet. Create a folder in the Folders tab first." tone="warning" />
              )}
            </FormField>
            <AppButton
              disabled={!folderOptions.length}
              label={submittingUpload ? `Uploading ${uploadProgress}%` : 'Upload File'}
              loading={submittingUpload}
              onPress={handleUpload}
            />
            {submittingUpload ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
            ) : null}
          </Card>
        ) : null}

        {message ? <MessageBanner message={message.text} tone={message.tone} /> : null}

        {loading ? (
          <LoadingState message="Loading files..." />
        ) : files.length ? (
          <View style={styles.list}>
            {files.map((file) => (
              <Card key={file.FileId}>
                <View style={styles.headerRow}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {file.OriginalName}
                  </Text>
                  <Badge label={file.FileType?.split('/').pop() || 'file'} />
                </View>
                <Text style={styles.meta}>Size: {formatFileSize(file.FileSize || 0)}</Text>
                <Text style={styles.meta}>Folder: {file.FolderId || 'Root'}</Text>
                <Text style={styles.meta}>Uploaded: {new Date(file.CreatedAt).toLocaleString()}</Text>
                <View style={styles.row}>
                  <AppButton
                    label="Open"
                    onPress={() => navigation.navigate('FileDetails', { fileId: file.FileId })}
                    style={styles.flexBtn}
                  />
                  {isAdmin ? (
                    <>
                      <AppButton label="Manage" onPress={() => startManage(file)} style={styles.flexBtn} variant="secondary" />
                      <AppButton
                        disabled={actingOnFileId === file.FileId}
                        label="Delete"
                        loading={actingOnFileId === file.FileId}
                        onPress={() => confirmDelete(file)}
                        style={styles.flexBtn}
                        variant="danger"
                      />
                    </>
                  ) : null}
                </View>

                {isAdmin && activeManageFileId === file.FileId ? (
                  <View style={styles.managePanel}>
                    <FormField error={renameError} label="Rename file" required>
                      <AppInput
                        error={Boolean(renameError)}
                        onChangeText={(value) => {
                          setRenameValue(value);
                          setRenameError(validateItemName(value, 'File name'));
                        }}
                        placeholder="New file name"
                        value={renameValue}
                      />
                    </FormField>
                    <AppButton
                      label="Save Name"
                      loading={actingOnFileId === file.FileId}
                      onPress={() => handleRename(file.FileId)}
                    />
                    <Text style={styles.softLabel}>Move to folder</Text>
                    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                      <Chip active={moveTargetFolderId === null} label="Root" onPress={() => setMoveTargetFolderId(null)} />
                      {folderOptions.map((folder) => (
                        <Chip
                          key={folder.id}
                          active={moveTargetFolderId === folder.id}
                          label={folder.label}
                          onPress={() => setMoveTargetFolderId(folder.id)}
                        />
                      ))}
                    </ScrollView>
                    <View style={styles.row}>
                      <AppButton
                        label="Move File"
                        loading={actingOnFileId === file.FileId}
                        onPress={() => handleMove(file.FileId)}
                        style={styles.flexBtn}
                      />
                      <AppButton label="Close" onPress={() => setActiveManageFileId(null)} style={styles.flexBtn} variant="ghost" />
                    </View>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState message="Try another search or clear the folder filter." title="No files found" />
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 28 },
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  flex: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flexBtn: { flexGrow: 1, minWidth: 96 },
  chipRow: { gap: 8, paddingRight: 8 },
  softLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  list: { gap: 12 },
  fileName: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.inkMuted, fontSize: 13 },
  managePanel: { borderTopColor: colors.borderSoft, borderTopWidth: 1, gap: 10, marginTop: 4, paddingTop: 12 },
  progressTrack: { backgroundColor: colors.bgSoft, borderRadius: 999, height: 8, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.accent, height: '100%' },
});
