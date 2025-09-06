import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  X,
  Check,
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
  className = '',
}) => {
  const internalFileTree = useFileTree();
  const fileTree = externalFileTree || internalFileTree;
  
  // CRUD operation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuNode, setContextMenuNode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const {
    treeState,
    isLoading,
    error,
    flatTree,
    treeStats,
    openDirectory,
    toggleFolder,
    selectFile,
  } = fileTree;

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuNode(null);
    };

    if (contextMenuNode) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenuNode]);

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

  // CRUD operation handlers
  const handleCreateNew = (type: 'file' | 'folder') => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  const handleStartRename = (node: FileTreeNode) => {
    setEditingNode(node.id);
    setEditName(node.name);
    setContextMenuNode(null);
  };

  const handleConfirmRename = async () => {
    if (!editingNode || !editName.trim()) return;
    
    try {
      // Implement rename logic here
      console.log('Renaming', editingNode, 'to', editName.trim());
      // TODO: Add actual rename implementation
      
      setEditingNode(null);
      setEditName('');
    } catch (error) {
      console.error('Error renaming:', error);
    }
  };

  const handleCancelRename = () => {
    setEditingNode(null);
    setEditName('');
  };

  const handleDelete = async (node: FileTreeNode) => {
    if (!confirm(`Are you sure you want to delete "${node.name}"?`)) {
      return;
    }
    
    try {
      // Implement delete logic here
      console.log('Deleting', node.name);
      // TODO: Add actual delete implementation
      
      setContextMenuNode(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleCreateSubmit = async (name: string) => {
    if (!name.trim()) return;
    
    try {
      // Implement create logic here
      console.log('Creating', createType, name.trim());
      // TODO: Add actual create implementation
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <HardDrive className="h-4 w-4 flex-shrink-0" />
            File Browser
          </button>
          {isExpanded && (
            <div className="flex items-center gap-2">
              {/* Create menu */}
              {treeState.nodes.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => handleCreateNew('file')}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
                    title="Create new file"
                  >
                    <Plus className="h-3 w-3" />
                    New
                  </button>
                </div>
              )}
              
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
          )}
        </div>

        {/* Statistics */}
        {isExpanded && treeState.nodes.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="truncate">{treeState.rootPath}</div>
            <div className="flex gap-4">
              <span>{treeStats.markdownFiles} markdown</span>
              <span>{treeStats.files} files</span>
              <span>{treeStats.folders} folders</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
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
          <div className="flex items-center justify-center h-16 p-4">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No folder opened</p>
            </div>
          </div>
        )}

        {/* File tree */}
        {flatTree.length > 0 && (
          <div className="p-2">
            {flatTree.map(node => {
              const Icon = getFileIcon(node);
              const isSelected = treeState.selectedFile === node.id;
              const hasChildren =
                node.type === 'folder' &&
                node.children &&
                node.children.length > 0;
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
                        onClick={e => {
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
                        onClick={e => handleFileOpen(node, e)}
                        className="p-1 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-400 rounded transition-colors flex-shrink-0"
                        title="Open file"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}

                    {/* Name - editable if in edit mode */}
                    {editingNode === node.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleConfirmRename();
                            } else if (e.key === 'Escape') {
                              handleCancelRename();
                            }
                          }}
                          className="flex-1 text-sm px-1 py-0.5 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          autoFocus
                        />
                        <button
                          onClick={handleConfirmRename}
                          className="p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-0.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
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
                    )}

                    {/* File size */}
                    {node.type === 'file' && node.size && editingNode !== node.id && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {formatFileSize(node.size)}
                      </span>
                    )}

                    {/* Context menu */}
                    {editingNode !== node.id && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuNode(contextMenuNode === node.id ? null : node.id);
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all flex-shrink-0"
                        >
                          <MoreVertical className="h-3 w-3 text-gray-500" />
                        </button>
                        
                        {contextMenuNode === node.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                            <button
                              onClick={() => handleStartRename(node)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit3 className="h-3 w-3" />
                              Rename
                            </button>
                            <button
                              onClick={() => handleDelete(node)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Create New {createType === 'file' ? 'File' : 'Folder'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              handleCreateSubmit(name);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder={createType === 'file' ? 'example.md' : 'folder-name'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;
