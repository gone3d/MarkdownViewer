import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  onFileLoad?: (file: File) => void;
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
  onFileLoad,
  className = '',
  headerIds,
}) => {
  // Local state for editor content (for split view synchronization)
  const [editorContent, setEditorContent] = useState<string>('');
  const [isHorizontalSplit, setIsHorizontalSplit] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for scroll synchronization
  const editorRef = useRef<{ getScrollElement: () => HTMLElement | null } | null>(null);
  const viewerRef = useRef<{ getScrollElement: () => HTMLElement | null } | null>(null);
  const isScrollingSyncRef = useRef<boolean>(false);

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
        console.log(
          `ContentArea dimensions: ${width}x${height}, horizontal: ${shouldBeHorizontal}`
        );
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

  // Smart cursor-based synchronization for split view
  const handleCursorPositionChange = useCallback((cursorPosition: number) => {
    console.log('🎯 Cursor position changed:', cursorPosition);
    console.log('📊 Current state:', { 
      isScrollingSync: isScrollingSyncRef.current, 
      viewMode, 
      hasViewer: !!viewerRef.current, 
      hasContent: !!currentFile?.content,
      headerIdsSize: headerIds?.size,
      headerIdsKeys: headerIds ? Array.from(headerIds.keys()).slice(0, 5) : []
    });
    
    if (isScrollingSyncRef.current || viewMode !== 'split' || !viewerRef.current || !currentFile?.content) {
      console.log('❌ Early return - conditions not met');
      return;
    }
    
    // Find which header section the cursor is in
    const content = currentFile.content;
    const lines = content.split('\n');
    let currentLine = 0;
    let charactersCount = 0;
    
    // Find the line number for the cursor position
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (charactersCount + lineLength > cursorPosition) {
        currentLine = i;
        break;
      }
      charactersCount += lineLength;
    }
    
    console.log('📍 Cursor at line:', currentLine, 'Line content:', lines[currentLine]);
    
    // Find the nearest header above the cursor
    let nearestHeaderText = '';
    for (let i = currentLine; i >= 0; i--) {
      const line = lines[i];
      const headerMatch = line.match(/^#{1,6}\s+(.+)$/);
      if (headerMatch) {
        nearestHeaderText = headerMatch[1].trim();
        console.log('🔍 Found header text:', nearestHeaderText);
        break;
      }
    }
    
    console.log('🗂️ Available headerIds keys:', Array.from(headerIds?.keys() || []));
    console.log('🎯 Looking for header text:', nearestHeaderText, 'Found?', headerIds?.has(nearestHeaderText));
    
    // Scroll viewer to the corresponding header if found
    if (nearestHeaderText && headerIds?.has(nearestHeaderText)) {
      console.log('✅ Scrolling to section:', nearestHeaderText);
      isScrollingSyncRef.current = true;
      
      try {
        const elementId = headerIds.get(nearestHeaderText)!;
        const element = document.getElementById(elementId);
        console.log('🎯 Target element:', elementId, 'Found?', !!element);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      } finally {
        // Reset sync flag after scrolling completes
        setTimeout(() => {
          isScrollingSyncRef.current = false;
        }, 500); // Longer delay for smooth scroll completion
      }
    } else {
      console.log('❌ No matching header found for sync - headerText:', nearestHeaderText);
    }
  }, [viewMode, currentFile?.content, headerIds]);

  // Legacy scroll synchronization - kept for viewer → editor sync only
  const handleEditorScroll = useCallback((_scrollTop: number, _scrollHeight: number, _clientHeight: number) => {
    // Disabled: Now using cursor-based sync instead
    return;
  }, []);

  const handleViewerScroll = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    if (isScrollingSyncRef.current || viewMode !== 'split' || !editorRef.current) return;
    
    isScrollingSyncRef.current = true;
    
    try {
      // Calculate scroll percentage
      const maxScroll = scrollHeight - clientHeight;
      const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
      
      // Apply to editor
      const editorElement = editorRef.current.getScrollElement?.() || editorRef.current;
      if (editorElement && 'scrollHeight' in editorElement) {
        const editorMaxScroll = editorElement.scrollHeight - editorElement.clientHeight;
        const targetScroll = editorMaxScroll * scrollPercentage;
        editorElement.scrollTop = Math.max(0, Math.min(targetScroll, editorMaxScroll));
      }
    } finally {
      // Reset sync flag after a brief delay
      setTimeout(() => {
        isScrollingSyncRef.current = false;
      }, 100);
    }
  }, [viewMode]);

  // Drag & Drop functionality
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Only process the first file
    const file = files[0];
    
    // Check if it's a valid markdown file
    const validExtensions = ['.md', '.markdown', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      console.warn('Invalid file type. Please drop a markdown file (.md, .markdown, .txt)');
      return;
    }

    try {
      // Use the onFileLoad callback if provided (for proper file loading integration)
      if (onFileLoad) {
        onFileLoad(file);
        console.log('File loaded via drag & drop:', file.name);
      }
    } catch (error) {
      console.error('Error loading dropped file:', error);
    }
  }, [onFileLoad]);

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
      <div 
        className={`flex items-center justify-center h-full ${className} relative`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 dark:border-blue-400 flex items-center justify-center z-10">
            <div className="text-center text-blue-600 dark:text-blue-400">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Drop your markdown file here</h3>
              <p>Supports .md, .markdown, and .txt files</p>
            </div>
          </div>
        )}
        
        <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
          <FileText className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Welcome to MarkdownViewer</h2>
          <p className="mb-6 leading-relaxed">
            Select a markdown file from the sidebar, open a file, or <span className="font-semibold text-blue-600 dark:text-blue-400">drag & drop a file here</span> to start
            viewing and editing your markdown content with live preview and
            table of contents.
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
        <div 
          className={`h-full ${className} relative`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 dark:border-blue-400 flex items-center justify-center z-20">
              <div className="text-center text-blue-600 dark:text-blue-400">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop to replace current file</h3>
                <p>Supports .md, .markdown, and .txt files</p>
              </div>
            </div>
          )}
          
          <MarkdownViewer
            file={currentFile}
            headerIds={headerIds}
            className="h-full"
          />
        </div>
      );

    case 'editor':
      return (
        <div 
          className={`h-full ${className} relative`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 dark:border-blue-400 flex items-center justify-center z-20">
              <div className="text-center text-blue-600 dark:text-blue-400">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop to replace current file</h3>
                <p>Supports .md, .markdown, and .txt files</p>
              </div>
            </div>
          )}
          
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
          className={`flex ${isHorizontalSplit ? 'flex-row' : 'flex-col'} h-full overflow-hidden ${className} relative`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 dark:border-blue-400 flex items-center justify-center z-20">
              <div className="text-center text-blue-600 dark:text-blue-400">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop to replace current file</h3>
                <p>Supports .md, .markdown, and .txt files</p>
              </div>
            </div>
          )}
          
          <div
            className={`${
              isHorizontalSplit
                ? 'w-1/2 border-r border-gray-200 dark:border-gray-700'
                : 'h-1/2 border-b border-gray-200 dark:border-gray-700 overflow-hidden'
            }`}
          >
            <MarkdownEditor
              ref={editorRef}
              file={currentFile}
              onChange={handleContentChange}
              onSave={handleSave}
              onScroll={handleEditorScroll}
              onCursorPositionChange={handleCursorPositionChange}
              className="h-full w-full"
            />
          </div>
          <div
            className={`${
              isHorizontalSplit ? 'w-1/2' : 'h-1/2 overflow-hidden'
            }`}
          >
            <MarkdownViewer
              ref={viewerRef}
              file={
                currentFile
                  ? {
                      ...currentFile,
                      content: editorContent || currentFile.content,
                    }
                  : null
              }
              headerIds={headerIds}
              onScroll={handleViewerScroll}
              className="h-full w-full"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className={`h-full ${className}`}>
          <MarkdownViewer
            file={currentFile}
            headerIds={headerIds}
            className="h-full"
          />
        </div>
      );
  }
};

export default ContentArea;
