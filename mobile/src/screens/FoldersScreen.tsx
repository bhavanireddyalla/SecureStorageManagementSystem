import { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  createFolder,
  deleteFolder,
  getFolderTree,
  getFolders,
  moveFolder,
  searchFolders,
  updateFolder,
} from '../api/folders';
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
import { colors } from '../theme/colors';
import { StorageFolder } from '../types/storage';
import { getErrorMessage, validateItemName } from '../utils/helpers';

type FlatFolderNode = StorageFolder & { depth: number };

function flattenTree(nodes: StorageFolder[], depth = 0): FlatFolderNode[] {
  return nodes.flatMap((folder) => [{ ...folder, depth }, ...flattenTree(folder.children || [], depth + 1)]);
}

export function FoldersScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [folders, setFolders] = useState<StorageFolder[]>([]);
  const [allFolders, setAllFolders] = useState<StorageFolder[]>([]);
  const [folderTree, setFolderTree] = useState<StorageFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderError, setNewFolderError] = useState('');
  const [newParentFolderId, setNewParentFolderId] = useState<number | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [moveParentFolderId, setMoveParentFolderId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const treeRows = useMemo(() => flattenTree(folderTree), [folderTree]);

  const loadFolderData = async (activeSearch = searchTerm, nextSort = sortBy) => {
    const [flatAll, tree] = await Promise.all([getFolders('name'), getFolderTree()]);
    setAllFolders(flatAll);

    if (activeSearch.trim()) {
      const searchResults = await searchFolders(activeSearch.trim());
      setFolders(searchResults);
      const matchingIds = new Set(searchResults.map((folder) => folder.FolderId));
      const filterTree = (nodes: StorageFolder[]): StorageFolder[] =>
        nodes
          .map((folder) => ({
            ...folder,
            children: filterTree(folder.children || []),
          }))
          .filter((folder) => matchingIds.has(folder.FolderId) || (folder.children && folder.children.length > 0));
      setFolderTree(filterTree(tree));
      return;
    }

    const [flatFolders, fullTree] = await Promise.all([getFolders(nextSort), getFolderTree()]);
    setFolders(flatFolders);
    setFolderTree(fullTree);
  };

  const hydrateFolders = async (showRefreshing = false, activeSearch = searchTerm, nextSort = sortBy) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setMessage(null);
      await loadFolderData(activeSearch, nextSort);
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to load folders.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    hydrateFolders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      return;
    }

    hydrateFolders(false, '', sortBy);
  }, [sortBy]);

  const handleCreateFolder = async () => {
    const error = validateItemName(newFolderName, 'Folder name');
    if (error) {
      setNewFolderError(error);
      setMessage({ tone: 'warning', text: error });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await createFolder(newFolderName.trim(), newParentFolderId);
      setNewFolderName('');
      setNewFolderError('');
      setNewParentFolderId(null);
      setMessage({ tone: 'success', text: 'Folder created successfully.' });
      await hydrateFolders();
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to create folder.') });
    } finally {
      setSubmitting(false);
    }
  };

  const beginManage = (folder: StorageFolder) => {
    setActiveFolderId(folder.FolderId);
    setRenameValue(folder.FolderName);
    setRenameError('');
    setMoveParentFolderId(folder.ParentFolderId ?? null);
  };

  const handleRenameFolder = async (folderId: number) => {
    const error = validateItemName(renameValue, 'Folder name');
    if (error) {
      setRenameError(error);
      return;
    }

    try {
      setSubmitting(true);
      await updateFolder(folderId, renameValue.trim());
      setActiveFolderId(null);
      setMessage({ tone: 'success', text: 'Folder renamed successfully.' });
      await hydrateFolders();
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to rename folder.') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveFolder = async (folderId: number) => {
    if (moveParentFolderId === folderId) {
      setMessage({ tone: 'warning', text: 'A folder cannot be moved into itself.' });
      return;
    }

    try {
      setSubmitting(true);
      await moveFolder(folderId, moveParentFolderId);
      setActiveFolderId(null);
      setMessage({ tone: 'success', text: 'Folder moved successfully.' });
      await hydrateFolders();
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to move folder.') });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (folder: StorageFolder) => {
    Alert.alert('Delete folder', `Delete "${folder.FolderName}"? Nested content may block deletion.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSubmitting(true);
            await deleteFolder(folder.FolderId);
            setMessage({ tone: 'success', text: 'Folder deleted successfully.' });
            await hydrateFolders();
          } catch (error: any) {
            setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to delete folder.') });
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout title="Folders" subtitle="Organize nested storage folders securely.">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => hydrateFolders(true)} />}
      >
        <Card>
          <View style={styles.headerRow}>
            <View style={styles.flex}>
              <SectionTitle>Folder access</SectionTitle>
              <BodyText>{isAdmin ? 'Create, rename, move, and delete enabled.' : 'Browse and search only.'}</BodyText>
            </View>
            <Badge label={user?.role || 'viewer'} tone={isAdmin ? 'accent' : 'neutral'} />
          </View>
        </Card>

        <Card>
          <SectionTitle>Search & sort</SectionTitle>
          <FormField error={searchError} label="Search folders">
            <AppInput
              autoCapitalize="none"
              autoCorrect={false}
              error={Boolean(searchError)}
              onChangeText={(value) => {
                setSearchTerm(value);
                setSearchError(value.trim() && value.trim().length < 2 ? 'Enter at least 2 characters to search.' : '');
              }}
              placeholder="Search by folder name"
              value={searchTerm}
            />
          </FormField>
          <View style={styles.row}>
            <AppButton
              label="Search"
              onPress={() => {
                if (searchTerm.trim() && searchTerm.trim().length < 2) {
                  setSearchError('Enter at least 2 characters to search.');
                  return;
                }
                hydrateFolders(false, searchTerm, sortBy);
              }}
              style={styles.flexBtn}
            />
            <AppButton
              label="Reset"
              onPress={() => {
                setSearchTerm('');
                setSearchError('');
                setSortBy('name');
                hydrateFolders(false, '', 'name');
              }}
              style={styles.flexBtn}
              variant="secondary"
            />
          </View>
          <View style={styles.rowWrap}>
            {(['name', 'date'] as const).map((option) => (
              <Chip key={option} active={sortBy === option} label={option} onPress={() => setSortBy(option)} />
            ))}
          </View>
        </Card>

        {isAdmin ? (
          <Card>
            <SectionTitle>Create folder</SectionTitle>
            <FormField error={newFolderError} label="Folder name" required>
              <AppInput
                error={Boolean(newFolderError)}
                onChangeText={(value) => {
                  setNewFolderName(value);
                  setNewFolderError(value ? validateItemName(value, 'Folder name') : '');
                }}
                placeholder="e.g. Contracts"
                value={newFolderName}
              />
            </FormField>
            <Text style={styles.softLabel}>Parent folder</Text>
            <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <Chip active={newParentFolderId === null} label="Root" onPress={() => setNewParentFolderId(null)} />
              {allFolders.map((folder) => (
                <Chip
                  key={folder.FolderId}
                  active={newParentFolderId === folder.FolderId}
                  label={folder.FolderName}
                  onPress={() => setNewParentFolderId(folder.FolderId)}
                />
              ))}
            </ScrollView>
            <AppButton label="Create Folder" loading={submitting} onPress={handleCreateFolder} />
          </Card>
        ) : null}

        {message ? <MessageBanner message={message.text} tone={message.tone} /> : null}

        {loading ? (
          <LoadingState message="Loading folders..." />
        ) : (
          <>
            <Card>
              <SectionTitle>Folder tree</SectionTitle>
              {treeRows.length ? (
                <View style={styles.tree}>
                  {treeRows.map((folder) => (
                    <View key={folder.FolderId} style={[styles.treeNode, { marginLeft: folder.depth * 14 }]}>
                      <Text style={styles.treeName}>{folder.FolderName}</Text>
                      <Text style={styles.meta}>ID {folder.FolderId}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <BodyText>No folders yet.</BodyText>
              )}
            </Card>

            <Card>
              <SectionTitle>Folder list</SectionTitle>
              {folders.length ? (
                <View style={styles.list}>
                  {folders.map((folder) => (
                    <View key={folder.FolderId} style={styles.folderItem}>
                      <Text style={styles.folderName}>{folder.FolderName}</Text>
                      <Text style={styles.meta}>Parent: {folder.ParentFolderId || 'Root'}</Text>
                      {isAdmin ? (
                        <View style={styles.row}>
                          <AppButton label="Manage" onPress={() => beginManage(folder)} style={styles.flexBtn} variant="secondary" />
                          <AppButton
                            disabled={submitting}
                            label="Delete"
                            onPress={() => confirmDelete(folder)}
                            style={styles.flexBtn}
                            variant="danger"
                          />
                        </View>
                      ) : null}
                      {isAdmin && activeFolderId === folder.FolderId ? (
                        <View style={styles.managePanel}>
                          <FormField error={renameError} label="Rename folder" required>
                            <AppInput
                              error={Boolean(renameError)}
                              onChangeText={(value) => {
                                setRenameValue(value);
                                setRenameError(validateItemName(value, 'Folder name'));
                              }}
                              placeholder="New folder name"
                              value={renameValue}
                            />
                          </FormField>
                          <AppButton label="Save Name" loading={submitting} onPress={() => handleRenameFolder(folder.FolderId)} />
                          <Text style={styles.softLabel}>Move under</Text>
                          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            <Chip active={moveParentFolderId === null} label="Root" onPress={() => setMoveParentFolderId(null)} />
                            {allFolders
                              .filter((candidate) => candidate.FolderId !== folder.FolderId)
                              .map((candidate) => (
                                <Chip
                                  key={candidate.FolderId}
                                  active={moveParentFolderId === candidate.FolderId}
                                  label={candidate.FolderName}
                                  onPress={() => setMoveParentFolderId(candidate.FolderId)}
                                />
                              ))}
                          </ScrollView>
                          <View style={styles.row}>
                            <AppButton label="Move Folder" loading={submitting} onPress={() => handleMoveFolder(folder.FolderId)} style={styles.flexBtn} />
                            <AppButton label="Close" onPress={() => setActiveFolderId(null)} style={styles.flexBtn} variant="ghost" />
                          </View>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState message="Create a root folder to start organizing files." title="No folders found" />
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
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  flex: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flexBtn: { flexGrow: 1, minWidth: 96 },
  chipRow: { gap: 8, paddingRight: 8 },
  softLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  tree: { gap: 8 },
  treeNode: { gap: 2 },
  treeName: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  meta: { color: colors.inkMuted, fontSize: 13 },
  list: { gap: 12 },
  folderItem: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  folderName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  managePanel: { borderTopColor: colors.borderSoft, borderTopWidth: 1, gap: 10, marginTop: 4, paddingTop: 12 },
});
