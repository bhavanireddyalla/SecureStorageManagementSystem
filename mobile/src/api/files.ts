import { apiClient } from './client';
import { StorageFile, FileSort } from '../types/storage';

export async function getFiles(sort?: FileSort, folderId?: number | null) {
  const params: Record<string, string | number> = {};

  if (sort) {
    params.sort = sort;
  }

  if (folderId !== undefined && folderId !== null) {
    params.folderId = folderId;
  }

  const response = await apiClient.get<StorageFile[]>('/files', { params });
  return response.data;
}

export async function searchFiles(name: string) {
  const response = await apiClient.get<StorageFile[]>('/files/search', {
    params: { name },
  });
  return response.data;
}

export async function getFileById(id: number) {
  const response = await apiClient.get<StorageFile>(`/files/${id}`);
  return response.data;
}

export async function getPresignedUrl(id: number) {
  const response = await apiClient.get<{ message: string; url: string }>(`/files/${id}/presigned-url`);
  return response.data;
}

export async function uploadFile(
  payload: FormData,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
) {
  const response = await apiClient.post('/files/upload', payload, {
    timeout: 120000,
    onUploadProgress,
  });
  return response.data;
}

export async function updateFile(id: number, originalName: string) {
  const response = await apiClient.put(`/files/${id}`, { originalName });
  return response.data;
}

export async function moveFile(id: number, folderId: number | null) {
  const response = await apiClient.put(`/files/${id}/move`, { folderId });
  return response.data;
}

export async function deleteFile(id: number) {
  const response = await apiClient.delete(`/files/${id}`);
  return response.data;
}
