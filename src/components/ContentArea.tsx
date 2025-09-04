import React, { useState, useEffect, useRef } from 'react';
import { MarkdownFile, ViewMode } from '../types/markdown';
import MarkdownViewer from './MarkdownViewer';
import MarkdownEditor from './MarkdownEditor';
import { FileText, AlertCircle } from 'lucide-react';

interface ContentAreaProps {
  currentFile: MarkdownFile | null;
  viewMode: ViewMode;
  isLoading?: boolean;
  error?: string | null;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  className?: string;
  headerIds?: Map<string, string>;
}

const ContentArea: React.FC<ContentAreaProps> = ({
  currentFile,
  viewMode,
  isLoading = false,
  error = null,
  onContentChange,
  onSave,
  className = '',
  headerIds,
}) => {
  // Local state for editor content (for split view synchronization)
  const [editorContent, setEditorContent] = useState<string>('');
  const [isHorizontalSplit, setIsHorizontalSplit] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize editor content when file changes
  useEffect(() => {
    if (currentFile?.content) {
      setEditorContent(currentFile.content);
    }
  }, [currentFile?.content]);

  // Monitor container dimensions for responsive split
  useEffect(() => {
    const updateSplitOrientation = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const shouldBeHorizontal = width > height;
        console.log(`ContentArea dimensions: ${width}x${height}, horizontal: ${shouldBeHorizontal}`);
        setIsHorizontalSplit(shouldBeHorizontal);
      }
    };

    // Add a small delay to ensure container is properly sized
    const timeoutId = setTimeout(updateSplitOrientation, 100);
    
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateSplitOrientation, 50);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [viewMode]);

  // Handle content changes from editor
  const handleContentChange = (content: string) => {
    setEditorContent(content);
    onContentChange?.(content);
  };

  // Handle save from editor
  const handleSave = (content: string) => {
    onSave?.(content);
  };
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading file...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading file</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Welcome state when no file is selected
  if (!currentFile) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
          <FileText className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Welcome to MarkdownViewer</h2>
          <p className="mb-6 leading-relaxed">
            Select a markdown file from the sidebar or open a file to start viewing and editing
            your markdown content with live preview and table of contents.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">Supported formats:</h3>
            <ul className="text-sm space-y-1">
              <li>• .md (Markdown)</li>
              <li>• .markdown</li>
              <li>• .txt (Plain text)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Render based on view mode
  switch (viewMode) {
    case 'viewer':
      return (
        <div className={`h-full ${className}`}>
          <MarkdownViewer file={currentFile} headerIds={headerIds} className="h-full" />
        </div>
      );

    case 'editor':
      return (
        <div className={`h-full ${className}`}>
          <MarkdownEditor 
            file={currentFile} 
            onChange={handleContentChange}
            onSave={handleSave}
            className="h-full" 
          />
        </div>
      );

    case 'split':
      return (
        <div 
          ref={containerRef}
          className={`flex ${isHorizontalSplit ? 'flex-row' : 'flex-col'} h-full overflow-hidden ${className}`}
        >
          <div className={`${
            isHorizontalSplit 
              ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' 
              : 'h-1/2 border-b border-gray-200 dark:border-gray-700 overflow-hidden'
          }`}>
            <MarkdownEditor 
              file={currentFile} 
              onChange={handleContentChange}
              onSave={handleSave}
              className="h-full w-full" 
            />
          </div>
          <div className={`${
            isHorizontalSplit 
              ? 'w-1/2' 
              : 'h-1/2 overflow-hidden'
          }`}>
            <MarkdownViewer 
              file={currentFile ? {
                ...currentFile,
                content: editorContent || currentFile.content
              } : null} 
              headerIds={headerIds}
              className="h-full w-full" 
            />
          </div>
        </div>
      );

    default:
      return (
        <div className={`h-full ${className}`}>
          <MarkdownViewer file={currentFile} headerIds={headerIds} className="h-full" />
        </div>
      );
  }
};

export default ContentArea;