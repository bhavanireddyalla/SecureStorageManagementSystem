import { colors } from '../theme/colors';

export function guessMimeType(fileName: string, fallback?: string | null) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return fallback || 'application/octet-stream';
  }
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getErrorMessage(error: any, fallback: string) {
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;

  if (apiMessage) {
    return apiMessage;
  }

  if (status === 401) {
    return 'Your session expired. Please sign in again.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (status === 404) {
    return 'The requested item was not found.';
  }

  if (status === 413) {
    return 'The file is too large to upload.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Check your connection and try again.';
  }

  if (error?.message === 'Network Error') {
    return 'Cannot reach the server. Check that the backend is running and your API URL is correct.';
  }

  return error?.message || fallback;
}

export function validateRequired(value: string, label: string) {
  if (!value.trim()) {
    return `${label} is required.`;
  }
  return '';
}

export function validateEmail(value: string) {
  const required = validateRequired(value, 'Email');
  if (required) {
    return required;
  }

  if (!isValidEmail(value)) {
    return 'Enter a valid email address (example: name@company.com).';
  }

  return '';
}

export function validatePassword(value: string, { minLength = 6, required = true } = {}) {
  if (!value.trim()) {
    return required ? 'Password is required.' : '';
  }

  if (value.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }

  return '';
}

export function validateName(value: string, label = 'Name') {
  const required = validateRequired(value, label);
  if (required) {
    return required;
  }

  if (value.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }

  if (value.trim().length > 100) {
    return `${label} must be 100 characters or less.`;
  }

  return '';
}

export function validateItemName(value: string, label: string) {
  const required = validateRequired(value, label);
  if (required) {
    return required;
  }

  if (value.trim().length > 120) {
    return `${label} must be 120 characters or less.`;
  }

  if (/[<>:"/\\|?*]/.test(value)) {
    return `${label} cannot include < > : " / \\ | ? *`;
  }

  return '';
}

export const ALLOWED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateUploadFile(file: { name: string; mimeType: string; size?: number } | null, folderId: number | null) {
  if (!file) {
    return 'Select a file to upload.';
  }

  if (!folderId) {
    return 'Choose a destination folder. Create one in Folders if none exist.';
  }

  if (!ALLOWED_UPLOAD_TYPES.includes(file.mimeType)) {
    return 'Invalid file type. Allowed formats: JPEG, PNG, PDF, DOC, DOCX.';
  }

  if ((file.size || 0) <= 0) {
    return 'The selected file appears empty. Choose another file.';
  }

  if ((file.size || 0) > MAX_UPLOAD_BYTES) {
    return 'File must be smaller than 10MB.';
  }

  return '';
}

export function roleBadgeColor(role?: string) {
  return role === 'admin' ? colors.accentSoft : colors.bgSoft;
}
