import { apiClient } from './client';

export type ManagedUser = {
  UserId: number;
  Name: string;
  Email: string;
  Role: 'admin' | 'viewer' | string;
};

export type ManagedUserPayload = {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'viewer';
};

export async function getUsers() {
  const response = await apiClient.get<ManagedUser[]>('/users');
  return response.data;
}

export async function createUser(payload: ManagedUserPayload) {
  const response = await apiClient.post('/users', payload);
  return response.data;
}

export async function updateUser(id: number, payload: Omit<ManagedUserPayload, 'password'>) {
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: number) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}
