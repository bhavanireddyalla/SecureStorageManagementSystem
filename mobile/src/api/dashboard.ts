import { apiClient } from './client';
import { StorageFile } from '../types/storage';

export type DashboardResponse = {
  totalUsers: number;
  totalFolders: number;
  totalFiles: number;
  recentFiles: StorageFile[];
};

export async function getDashboard() {
  const response = await apiClient.get<DashboardResponse>('/dashboard');
  return response.data;
}
