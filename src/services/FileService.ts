import { MarkdownFile, MarkdownFolder } from '../types/markdown';

export class FileValidationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export class FileOperationError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

class FileService {
  private static instance: FileService;
  private fileSystemSupported: boolean;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly SUPPORTED_EXTENSIONS = ['.md', '.markdown', '.txt', '.text'];

  constructor() {
    this.fileSystemSupported = 'showOpenFilePicker' in window;
  }

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  public isFileSystemAccessSupported(): boolean {
    return this.fileSystemSupported;
  }

  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new FileValidationError(
        `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (10MB)`,
        'FILE_TOO_LARGE'
      );
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!this.SUPPORTED_EXTENSIONS.includes(extension)) {
      throw new FileValidationError(
        `File type '${extension}' is not supported. Supported types: ${this.SUPPORTED_EXTENSIONS.join(', ')}`,
        'UNSUPPORTED_FILE_TYPE'
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new FileValidationError('File is empty', 'EMPTY_FILE');
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  private extractMetadata(content: string): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Word count
    const wordCount = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    metadata.wordCount = wordCount;
    metadata.estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute

    // Header count
    const headers = content.match(/^#{1,6}\s.+$/gm) || [];
    metadata.headerCount = headers.length;

    // Line count
    metadata.lineCount = content.split('\n').length;

    // Character count
    metadata.charCount = content.length;

    // Check for frontmatter
    const hasFrontmatter = content.startsWith('---\n');
    metadata.hasFrontmatter = hasFrontmatter;

    // Extract images
    const images = content.match(/!\[.*?\]\([^)]+\)/g) || [];
    metadata.imageCount = images.length;

    // Extract links
    const links = content.match(/(?<!!)\[([^\]]+)\]\([^)]+\)/g) || [];
    metadata.linkCount = links.length;

    return metadata;
  }

  public async openFile(): Promise<MarkdownFile | null> {
    if (!this.fileSystemSupported) {
      return this.openFileFallback();
    }

    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Markdown files',
            accept: {
              'text/markdown': ['.md', '.markdown'],
              'text/plain': ['.txt', '.text'],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });

      const file = await fileHandle.getFile();

      // Validate file before processing
      try {
        this.validateFile(file);
      } catch (error) {
        throw new FileOperationError(
          `File validation failed: ${(error as Error).message}`,
          'VALIDATION_ERROR',
          error as Error
        );
      }

      const content = await file.text();
      const metadata = this.extractMetadata(content);

      return {
        id: crypto.randomUUID(),
        name: file.name,
        path: fileHandle.name,
        content,
        size: file.size,
        lastModified: new Date(file.lastModified),
        created: new Date(file.lastModified),
        metadata,
        fileHandle, // Store the fileHandle for later saving
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null; // User cancelled
      }

      if (
        error instanceof FileOperationError ||
        error instanceof FileValidationError
      ) {
        throw error; // Re-throw our custom errors
      }

      throw new FileOperationError(
        'Failed to open file',
        'FILE_READ_ERROR',
        error as Error
      );
    }
  }

  private async openFileFallback(): Promise<MarkdownFile | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt,.text';

      input.onchange = async event => {
        try {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve(null);
            return;
          }

          // Validate file
          this.validateFile(file);

          const content = await file.text();
          const metadata = this.extractMetadata(content);

          resolve({
            id: crypto.randomUUID(),
            name: file.name,
            path: file.name,
            content,
            size: file.size,
            lastModified: new Date(file.lastModified),
            created: new Date(file.lastModified),
            metadata,
          });
        } catch (error) {
          if (error instanceof FileValidationError) {
            reject(error);
          } else {
            reject(
              new FileOperationError(
                'Failed to process selected file',
                'FALLBACK_ERROR',
                error as Error
              )
            );
          }
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  public async openFolder(): Promise<MarkdownFolder | null> {
    if (!this.fileSystemSupported) {
      throw new Error('Folder access not supported in this browser');
    }

    try {
      const directoryHandle = await (window as any).showDirectoryPicker();
      return this.readDirectory(directoryHandle);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      throw error;
    }
  }

  private async readDirectory(
    directoryHandle: any,
    parentPath = ''
  ): Promise<MarkdownFolder> {
    const files: MarkdownFile[] = [];
    const subfolders: MarkdownFolder[] = [];
    const currentPath = parentPath
      ? `${parentPath}/${directoryHandle.name}`
      : directoryHandle.name;

    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === 'file' && this.isMarkdownFile(name)) {
        const file = await handle.getFile();
        const content = await file.text();

        files.push({
          id: crypto.randomUUID(),
          name: file.name,
          path: `${currentPath}/${file.name}`,
          content,
          size: file.size,
          lastModified: new Date(file.lastModified),
          created: new Date(file.lastModified),
        });
      } else if (handle.kind === 'directory') {
        const subfolder = await this.readDirectory(handle, currentPath);
        subfolders.push(subfolder);
      }
    }

    return {
      id: crypto.randomUUID(),
      name: directoryHandle.name,
      path: currentPath,
      files,
      subfolders,
      parent: parentPath || undefined,
    };
  }

  private isMarkdownFile(filename: string): boolean {
    const extensions = ['.md', '.markdown', '.txt'];
    return extensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  /**
   * Process a File object into a MarkdownFile
   */
  public async processFile(file: File, content: string): Promise<MarkdownFile> {
    // Validate file
    this.validateFile(file);

    // Extract metadata
    const metadata = this.extractMetadata(content);

    return {
      id: crypto.randomUUID(),
      name: file.name,
      path: file.name, // For directory files, this would be the full path
      content,
      size: file.size,
      lastModified: new Date(file.lastModified),
      created: new Date(file.lastModified), // Use lastModified as created date
      metadata,
    };
  }

  public async saveFile(file: MarkdownFile, content: string): Promise<{ success: boolean; fileHandle?: FileSystemFileHandle }> {
    try {
      // Debug logging
      console.log('Save attempt:', {
        fileName: file.name,
        hasFileHandle: !!file.fileHandle,
        fileSystemSupported: this.fileSystemSupported,
        filePath: file.path
      });

      // Use File System Access API if we have a fileHandle
      if (file.fileHandle && this.fileSystemSupported) {
        console.log('Using File System Access API for save');
        const writable = await file.fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return { success: true, fileHandle: file.fileHandle };
      }

      // For new files without fileHandle, use save-as dialog
      if (this.fileSystemSupported && !file.fileHandle) {
        console.log('Using File System Access API save-as for new file');
        return await this.saveAsFile(file.name, content);
      }

      // Fallback: trigger download for browsers without File System Access API support
      console.log('Falling back to download - File System Access API not supported');
      const success = this.downloadFile(file.name, content);
      return { success };
    } catch (error) {
      console.error('Error saving file:', error);

      // If File System Access API fails, fall back to download
      console.warn(
        'File System Access API save failed, falling back to download'
      );
      const success = this.downloadFile(file.name, content);
      return { success };
    }
  }

  private async saveAsFile(suggestedName: string, content: string): Promise<{ success: boolean; fileHandle?: FileSystemFileHandle }> {
    try {
      const fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: 'Markdown files',
            accept: {
              'text/markdown': ['.md', '.markdown'],
              'text/plain': ['.txt'],
            },
          },
        ],
        suggestedName,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      return { success: true, fileHandle };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled
        return { success: false };
      }
      throw error;
    }
  }

  private downloadFile(fileName: string, content: string): boolean {
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      return false;
    }
  }
}

export default FileService;
