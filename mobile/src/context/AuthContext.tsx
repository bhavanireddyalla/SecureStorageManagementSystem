import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import { AuthResponse, AuthUser } from '../types/auth';
import { clearSession, getStoredToken, getStoredUser, persistSession } from '../utils/authStorage';

type AuthContextValue = {
  isHydrating: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUserRole = (user: Partial<AuthUser> | null | undefined): AuthUser | null => {
  if (!user || !user.email || !user.name || !user.role) {
    return null;
  }

  const role = user.role.toString().toLowerCase();

  return {
    id: user.id ?? '',
    name: user.name,
    email: user.email,
    role: role === 'admin' ? 'admin' : 'viewer',
  };
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([getStoredToken(), getStoredUser()]);

        if (!mounted) {
          return;
        }

        setToken(storedToken);
        setUser(normalizeUserRole(storedUser));
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isHydrating,
      token,
      user,
      login: async (data) => {
        const normalizedUser = normalizeUserRole(data.user);

        if (!normalizedUser) {
          throw new Error('Invalid user payload received from the server.');
        }

        await persistSession(data.token, normalizedUser);
        setToken(data.token);
        setUser(normalizedUser);
      },
      logout: async () => {
        await clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [isHydrating, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
