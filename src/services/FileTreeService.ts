import { FileTreeNode } from '../types/fileTree';

export class FileTreeService {
  private static instance: FileTreeService;

  static getInstance(): FileTreeService {
    if (!FileTreeService.instance) {
      FileTreeService.instance = new FileTreeService();
    }
    return FileTreeService.instance;
  }

  /**
   * Check if File System Access API is supported
   */
  isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Open directory picker and build file tree
   */
  async openDirectory(): Promise<FileTreeNode | null> {
    if (!this.isFileSystemAccessSupported()) {
      throw new Error('File System Access API not supported');
    }

    try {
      // Show directory picker - user selection IS the permission grant
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
        startIn: 'documents', // Better UX: start in documents folder
      });

      // Build tree from directory handle
      const rootNode = await this.buildTreeFromHandle(directoryHandle, 0);
      return rootNode;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null; // User cancelled
      }
      throw error;
    }
  }

  /**
   * Build tree structure from directory handle
   */
  private async buildTreeFromHandle(
    handle: any,
    depth: number,
    parentPath = ''
  ): Promise<FileTreeNode> {
    const path = parentPath ? `${parentPath}/${handle.name}` : handle.name;

    if (handle.kind === 'file') {
      const file = await handle.getFile();
      return {
        id: path,
        name: handle.name,
        path,
        type: 'file',
        size: file.size,
        lastModified: new Date(file.lastModified),
        isMarkdown: this.isMarkdownFile(handle.name),
        depth,
        handle,
      };
    }

    // Directory
    const children: FileTreeNode[] = [];
    const entries = [];

    // Collect all entries
    for await (const [name, childHandle] of handle.entries()) {
      entries.push({ name, handle: childHandle });
    }

    // Sort entries (folders first, then files, alphabetically)
    entries.sort((a, b) => {
      if (a.handle.kind !== b.handle.kind) {
        return a.handle.kind === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // Process children
    for (const { handle: childHandle } of entries) {
      try {
        const childNode = await this.buildTreeFromHandle(
          childHandle,
          depth + 1,
          path
        );
        children.push(childNode);
      } catch (error) {
        // Skip files we can't read
        console.warn(`Skipping ${childHandle.name}:`, error);
      }
    }

    return {
      id: path,
      name: handle.name,
      path,
      type: 'folder',
      children,
      isExpanded: depth === 0, // Root folder expanded by default
      depth,
      handle,
    };
  }

  /**
   * Check if file is a markdown file
   */
  private isMarkdownFile(fileName: string): boolean {
    const extensions = ['.md', '.markdown', '.mdown', '.mkd', '.mkdn', '.txt'];
    return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  /**
   * Flatten tree for easier rendering
   */
  flattenTree(
    nodes: FileTreeNode[],
    expandedFolders: Set<string>
  ): FileTreeNode[] {
    const result: FileTreeNode[] = [];

    function traverse(nodes: FileTreeNode[], parentExpanded = true) {
      for (const node of nodes) {
        if (parentExpanded) {
          result.push(node);
        }

        if (node.type === 'folder' && node.children && parentExpanded) {
          const isExpanded = expandedFolders.has(node.id);
          traverse(node.children, isExpanded);
        }
      }
    }

    traverse(nodes);
    return result;
  }

  /**
   * Find node by ID in tree
   */
  findNodeById(nodes: FileTreeNode[], id: string): FileTreeNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Count files and folders in tree
   */
  getTreeStats(nodes: FileTreeNode[]): {
    files: number;
    folders: number;
    markdownFiles: number;
  } {
    let files = 0;
    let folders = 0;
    let markdownFiles = 0;

    function traverse(nodes: FileTreeNode[]) {
      for (const node of nodes) {
        if (node.type === 'file') {
          files++;
          if (node.isMarkdown) markdownFiles++;
        } else {
          folders++;
          if (node.children) traverse(node.children);
        }
      }
    }

    traverse(nodes);
    return { files, folders, markdownFiles };
  }

  /**
   * Load file content from a file handle
   */
  async loadFileFromHandle(fileHandle: any): Promise<File> {
    if (!fileHandle || fileHandle.kind !== 'file') {
      throw new Error('Invalid file handle');
    }

    return await fileHandle.getFile();
  }
}
