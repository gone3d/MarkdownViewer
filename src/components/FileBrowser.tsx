import React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  File, 
  FileText,
  Loader2,
  AlertCircle,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { FileTreeNode } from '../types/fileTree';
import { useFileTree } from '../hooks/useFileTree';

interface FileBrowserProps {
  onFileSelect?: (node: FileTreeNode) => void;
  onFileOpen?: (node: FileTreeNode) => void;
  fileTree?: ReturnType<typeof useFileTree>;
  className?: string;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ 
  onFileSelect, 
  onFileOpen,
  fileTree: externalFileTree,
  className = '' 
}) => {
  const internalFileTree = useFileTree();
  const fileTree = externalFileTree || internalFileTree;
  
  const { 
    treeState, 
    isLoading, 
    error, 
    flatTree, 
    treeStats,
    openDirectory, 
    toggleFolder, 
    selectFile 
  } = fileTree;

  // Handle file click
  const handleFileClick = (node: FileTreeNode) => {
    if (node.type === 'file') {
      selectFile(node.id);
      onFileSelect?.(node);
    }
  };

  // Handle file open
  const handleFileOpen = (node: FileTreeNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (node.type === 'file' && node.isMarkdown && onFileOpen) {
      onFileOpen(node);
    }
  };

  // Check if file can be opened
  const canOpenFile = (node: FileTreeNode): boolean => {
    return node.type === 'file' && Boolean(node.isMarkdown);
  };

  // Handle folder click
  const handleFolderClick = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    }
  };

  // Get file icon
  const getFileIcon = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      const isExpanded = treeState.expandedFolders.has(node.id);
      return isExpanded ? FolderOpen : Folder;
    }
    
    return node.isMarkdown ? FileText : File;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HardDrive className="h-4 w-4 flex-shrink-0" />
            File Browser
          </h3>
          <button
            onClick={openDirectory}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Folder className="h-3 w-3" />
            )}
            {isLoading ? 'Opening...' : 'Open Folder'}
          </button>
        </div>

        {/* Statistics */}
        {treeState.nodes.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>{treeState.rootPath}</div>
            <div className="flex gap-4">
              <span>{treeStats.markdownFiles} markdown</span>
              <span>{treeStats.files} files</span>
              <span>{treeStats.folders} folders</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Opening directory...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center h-32 p-4">
            <div className="text-center text-red-600 dark:text-red-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && treeState.nodes.length === 0 && (
          <div className="flex items-center justify-center h-32 p-4">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Folder className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm font-medium mb-2">No folder selected</p>
              <p className="text-xs mb-4">Choose a folder to browse markdown files</p>
              <button
                onClick={openDirectory}
                className="text-xs px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                Open Folder
              </button>
            </div>
          </div>
        )}

        {/* File tree */}
        {flatTree.length > 0 && (
          <div className="p-2">
            {flatTree.map((node) => {
              const Icon = getFileIcon(node);
              const isSelected = treeState.selectedFile === node.id;
              const hasChildren = node.type === 'folder' && node.children && node.children.length > 0;
              const isExpanded = treeState.expandedFolders.has(node.id);

              return (
                <div key={node.id} className="group">
                  <div
                    className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    style={{ marginLeft: `${node.depth * 16}px` }}
                    onClick={() => {
                      if (node.type === 'folder') {
                        handleFolderClick(node);
                      } else {
                        handleFileClick(node);
                      }
                    }}
                  >
                    {/* Folder expand/collapse button */}
                    {node.type === 'folder' && (
                      <button
                        className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFolderClick(node);
                        }}
                      >
                        {hasChildren ? (
                          isExpanded ? (
                            <ChevronDown className="h-3 w-3 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          )
                        ) : (
                          <div className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    {/* File spacing */}
                    {node.type === 'file' && (
                      <div className="w-4 flex-shrink-0" />
                    )}

                    {/* Icon */}
                    <Icon 
                      className={`h-4 w-4 flex-shrink-0 ${
                        node.type === 'folder' 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : node.isMarkdown 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} 
                    />

                    {/* Open button for selected markdown files */}
                    {isSelected && canOpenFile(node) && (
                      <button
                        onClick={(e) => handleFileOpen(node, e)}
                        className="p-1 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-400 rounded transition-colors flex-shrink-0"
                        title="Open file"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}

                    {/* Name */}
                    <span 
                      className={`flex-1 text-sm truncate ${
                        isSelected 
                          ? 'font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      title={node.name}
                    >
                      {node.name}
                    </span>

                    {/* File size */}
                    {node.type === 'file' && node.size && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {formatFileSize(node.size)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowser;