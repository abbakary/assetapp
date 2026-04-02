// File storage utility for managing uploaded documents
// This uses localStorage for demo purposes. In production, files would be sent to a server.

interface StoredFile {
  id: string;
  name: string;
  size: string;
  type: string;
  assetId: string;
  uploadDate: string;
  dataUrl: string; // Base64 encoded or data URL
  mimeType: string;
  uploadedAt: number;
}

const STORAGE_KEY = 'asset_system_files';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file for localStorage
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total limit

class FileStorage {
  /**
   * Store a file in localStorage
   */
  static storeFile(
    file: File,
    assetId: string,
    documentType: string,
    documentId: string
  ): Promise<StoredFile> {
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const dataUrl = reader.result as string;

          // Check total storage
          const currentStorage = this.getAllFiles();
          const currentSize = currentStorage.reduce((sum, f) => sum + f.dataUrl.length, 0);

          if (currentSize + dataUrl.length > MAX_TOTAL_SIZE) {
            reject(new Error('Storage quota exceeded. Please delete some documents.'));
            return;
          }

          const storedFile: StoredFile = {
            id: documentId,
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            type: documentType,
            assetId,
            uploadDate: new Date().toISOString().split('T')[0],
            dataUrl,
            mimeType: file.type,
            uploadedAt: Date.now(),
          };

          // Save to localStorage
          const files = this.getAllFiles();
          files.push(storedFile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

          resolve(storedFile);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Read file as data URL (base64)
      reader.readAsDataURL(file);
    });
  }

  /**
   * Retrieve a file by ID
   */
  static getFile(fileId: string): StoredFile | null {
    const files = this.getAllFiles();
    return files.find((f) => f.id === fileId) || null;
  }

  /**
   * Get all stored files
   */
  static getAllFiles(): StoredFile[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      console.error('Failed to retrieve files from storage');
      return [];
    }
  }

  /**
   * Get files by asset ID
   */
  static getFilesByAsset(assetId: string): StoredFile[] {
    return this.getAllFiles().filter((f) => f.assetId === assetId);
  }

  /**
   * Delete a file
   */
  static deleteFile(fileId: string): boolean {
    try {
      const files = this.getAllFiles();
      const filtered = files.filter((f) => f.id !== fileId);

      if (filtered.length < files.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete file', error);
      return false;
    }
  }

  /**
   * Clear all stored files
   */
  static clearAllFiles(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear storage', error);
    }
  }

  /**
   * Get storage usage stats
   */
  static getStorageStats() {
    const files = this.getAllFiles();
    const totalSize = files.reduce((sum, f) => sum + f.dataUrl.length, 0);
    const maxSize = MAX_TOTAL_SIZE;
    const usagePercent = (totalSize / maxSize) * 100;

    return {
      fileCount: files.length,
      totalSize,
      maxSize,
      usagePercent,
      formattedSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB / ${(maxSize / 1024 / 1024).toFixed(0)} MB`,
    };
  }
}

export default FileStorage;
