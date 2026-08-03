import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createUser, deleteUser, getUsers, ManagedUser, updateUser } from '../api/users';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  AppButton,
  AppInput,
  Badge,
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
import { getErrorMessage, validateEmail, validateName, validatePassword } from '../utils/helpers';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'viewer' as 'admin' | 'viewer',
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export function UsersScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setMessage(null);
      setUsers(await getUsers());
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to load users.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user?.role]);

  const resetForm = () => {
    setForm(initialForm);
    setFieldErrors({});
    setSelectedUser(null);
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {
      name: validateName(form.name, 'Full name'),
      email: validateEmail(form.email),
      password: selectedUser ? '' : validatePassword(form.password, { minLength: 6 }),
    };

    setFieldErrors(nextErrors);
    return !nextErrors.name && !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setMessage({ tone: 'warning', text: 'Please fix the highlighted fields before saving.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      if (selectedUser) {
        await updateUser(selectedUser.UserId, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
        setMessage({ tone: 'success', text: 'User updated successfully.' });
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
        setMessage({ tone: 'success', text: 'User created successfully.' });
      }

      resetForm();
      await loadUsers();
    } catch (error: any) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to save user.') });
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (targetUser: ManagedUser) => {
    setSelectedUser(targetUser);
    setFieldErrors({});
    setForm({
      name: targetUser.Name,
      email: targetUser.Email,
      password: '',
      role: targetUser.Role.toLowerCase() === 'admin' ? 'admin' : 'viewer',
    });
  };

  const confirmDelete = (targetUser: ManagedUser) => {
    if (String(targetUser.UserId) === String(user?.id)) {
      setMessage({ tone: 'warning', text: 'You cannot delete your own account while signed in.' });
      return;
    }

    Alert.alert('Delete user', `Delete "${targetUser.Name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSubmitting(true);
            await deleteUser(targetUser.UserId);
            if (selectedUser?.UserId === targetUser.UserId) {
              resetForm();
            }
            setMessage({ tone: 'success', text: 'User deleted successfully.' });
            await loadUsers();
          } catch (error: any) {
            setMessage({ tone: 'error', text: getErrorMessage(error, 'Unable to delete user.') });
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (user?.role !== 'admin') {
    return (
      <ScreenLayout title="Users" subtitle="Admin access required." centerContent>
        <EmptyState message="Viewer accounts cannot manage users." title="Permission denied" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Users" subtitle="Create and manage Admin and Viewer accounts.">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadUsers(true)} />}
      >
        <Card>
          <SectionTitle>{selectedUser ? 'Edit user' : 'Create user'}</SectionTitle>
          <FormField error={fieldErrors.name} label="Full name" required>
            <AppInput
              error={Boolean(fieldErrors.name)}
              onChangeText={(value) => {
                setForm((current) => ({ ...current, name: value }));
                setFieldErrors((current) => ({ ...current, name: validateName(value, 'Full name') }));
              }}
              placeholder="Full name"
              value={form.name}
            />
          </FormField>
          <FormField error={fieldErrors.email} label="Email" required>
            <AppInput
              autoCapitalize="none"
              error={Boolean(fieldErrors.email)}
              keyboardType="email-address"
              onChangeText={(value) => {
                setForm((current) => ({ ...current, email: value }));
                setFieldErrors((current) => ({ ...current, email: validateEmail(value) }));
              }}
              placeholder="name@company.com"
              value={form.email}
            />
          </FormField>
          {!selectedUser ? (
            <FormField error={fieldErrors.password} hint="Minimum 6 characters." label="Password" required>
              <AppInput
                error={Boolean(fieldErrors.password)}
                onChangeText={(value) => {
                  setForm((current) => ({ ...current, password: value }));
                  setFieldErrors((current) => ({
                    ...current,
                    password: validatePassword(value, { minLength: 6 }),
                  }));
                }}
                placeholder="Create a password"
                secureTextEntry
                value={form.password}
              />
            </FormField>
          ) : null}
          <Text style={styles.softLabel}>Role</Text>
          <View style={styles.rowWrap}>
            {(['viewer', 'admin'] as const).map((role) => (
              <Chip
                key={role}
                active={form.role === role}
                label={role}
                onPress={() => setForm((current) => ({ ...current, role }))}
              />
            ))}
          </View>
          <View style={styles.row}>
            <AppButton
              label={selectedUser ? 'Update User' : 'Create User'}
              loading={submitting}
              onPress={handleSubmit}
              style={styles.flexBtn}
            />
            {selectedUser ? (
              <AppButton label="Cancel" onPress={resetForm} style={styles.flexBtn} variant="ghost" />
            ) : null}
          </View>
        </Card>

        {message ? <MessageBanner message={message.text} tone={message.tone} /> : null}

        <Card>
          <SectionTitle>Existing users</SectionTitle>
          {loading ? (
            <LoadingState message="Loading users..." />
          ) : users.length ? (
            <View style={styles.list}>
              {users.map((managedUser) => {
                const isSelf = String(managedUser.UserId) === String(user?.id);
                const isAdminRole = managedUser.Role.toLowerCase() === 'admin';

                return (
                  <View key={managedUser.UserId} style={styles.userCard}>
                    <View style={styles.headerRow}>
                      <Text style={styles.userName}>{managedUser.Name}</Text>
                      <Badge label={managedUser.Role} tone={isAdminRole ? 'accent' : 'neutral'} />
                    </View>
                    <Text style={styles.meta}>{managedUser.Email}</Text>
                    {isSelf ? <Text style={styles.selfTag}>Current account</Text> : null}
                    <View style={styles.row}>
                      <AppButton label="Edit" onPress={() => beginEdit(managedUser)} style={styles.flexBtn} variant="secondary" />
                      <AppButton
                        disabled={submitting || isSelf}
                        label="Delete"
                        onPress={() => confirmDelete(managedUser)}
                        style={styles.flexBtn}
                        variant="danger"
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState message="Create your first Admin or Viewer account." title="No users found" />
          )}
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 28 },
  softLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flexBtn: { flexGrow: 1, minWidth: 96 },
  list: { gap: 12 },
  userCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  headerRow: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  userName: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.inkMuted, fontSize: 13 },
  selfTag: { color: colors.accent, fontSize: 12, fontWeight: '700' },
});
