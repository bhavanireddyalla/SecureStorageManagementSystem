export type UserRole = 'admin' | 'viewer';

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
