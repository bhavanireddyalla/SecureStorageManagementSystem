import { apiClient } from './client';
import { AuthResponse, LoginPayload } from '../types/auth';

export async function loginUser(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}
