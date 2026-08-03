import { apiClient } from './client';
import { StorageFolder } from '../types/storage';

export async function getFolders(sort?: 'name' | 'date') {
  const params: Record<string, string> = {};

  if (sort) {
    params.sort = sort;
  }

  const response = await apiClient.get<StorageFolder[]>('/folders', { params });
  return response.data;
}

export async function getFolderTree() {
  const response = await apiClient.get<StorageFolder[]>('/folders/tree');
  return response.data;
}

export async function searchFolders(name: string) {
  const response = await apiClient.get<StorageFolder[]>('/folders/search', {
    params: { name },
  });
  return response.data;
}

export async function createFolder(folderName: string, parentFolderId: number | null) {
  const response = await apiClient.post('/folders', { folderName, parentFolderId });
  return response.data;
}

export async function updateFolder(id: number, folderName: string) {
  const response = await apiClient.put(`/folders/${id}`, { folderName });
  return response.data;
}

export async function moveFolder(id: number, parentFolderId: number | null) {
  const response = await apiClient.put(`/folders/${id}/move`, { parentFolderId });
  return response.data;
}

export async function deleteFolder(id: number) {
  const response = await apiClient.delete(`/folders/${id}`);
  return response.data;
}
