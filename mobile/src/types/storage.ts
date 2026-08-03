export type StorageFile = {
  FileId: number;
  FolderId: number | null;
  OriginalName: string;
  FileType: string;
  FileSize: number;
  CreatedAt: string;
  StorageKey?: string;
};

export type StorageFolder = {
  FolderId: number;
  ParentFolderId: number | null;
  FolderName: string;
  children?: StorageFolder[];
};

export type FileSort = 'date' | 'name' | 'size';
