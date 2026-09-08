export interface MediaRecord {
  id: string;
  blob: Blob;
  thumbnail: Blob;
  mimeType: string;
  size: number;
  storageLocation?: 'indexeddb' | 'opfs';
}
