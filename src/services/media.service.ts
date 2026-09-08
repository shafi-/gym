import type { MediaRecord } from '../models/media.model';
import { MediaRepository } from '../repositories/media.repository';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export class MediaService {
  private mediaRepo = new MediaRepository();

  async getMediaById(id: string): Promise<MediaRecord | undefined> {
    return this.mediaRepo.findById(id);
  }

  async uploadMedia(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<MediaRecord> {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    onProgress?.(50);

    // Generate thumbnail for images
    let thumbnail: Blob;
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      thumbnail = await this.generateImageThumbnail(file);
    } else {
      thumbnail = await this.generateVideoThumbnail(file);
    }

    onProgress?.(80);

    const media: MediaRecord = {
      id: crypto.randomUUID(),
      blob: file,
      thumbnail,
      mimeType: file.type,
      size: file.size,
      storageLocation: 'indexeddb',
    };

    const saved = await this.mediaRepo.create(media);
    onProgress?.(100);

    return saved;
  }

  async deleteMedia(id: string): Promise<void> {
    await this.mediaRepo.delete(id);
  }

  async getTotalStorageUsed(): Promise<number> {
    return this.mediaRepo.getTotalSize();
  }

  private async generateImageThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Center crop to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not generate thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load image'));
      };

      img.src = url;
    });
  }

  private async generateVideoThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Center crop to square
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - minDim) / 2;
        const sy = (video.videoHeight - minDim) / 2;

        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not generate thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load video'));
      };

      video.src = url;
    });
  }
}
