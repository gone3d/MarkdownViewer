import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileText, Hash, MessageSquare } from 'lucide-react';
import { UniversalFile } from '../types/markdown';
import { extractTableOfContents, flattenTOC } from '../utils/tocExtractor';
import YamlService from '../services/YamlService';

interface TableOfContentsProps {
  currentFile: UniversalFile | null;
  headerIds?: Map<string, string>;
  className?: string;
  onScrollToLine?: (lineNumber: number) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  currentFile,
  headerIds,
  className = '',
  onScrollToLine,
}) => {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const yamlService = YamlService.getInstance();

  // Check if current file is YAML
  const isYamlFile = currentFile?.fileType === 'yaml';

  // Extract TOC from current file
  const tocItems = useMemo(() => {
    if (!currentFile?.content) return [];

    if (isYamlFile) {
      // Extract YAML comments as outline items
      const comments = yamlService.extractComments(currentFile.content);
      return comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        level: comment.indent + 1, // Convert indent to level
        anchor: comment.id,
        children: [],
        depth: comment.indent,
        lineNumber: comment.line, // Add line number for scrolling
      }));
    }

    return extractTableOfContents(currentFile.content, headerIds);
  }, [currentFile?.content, currentFile?.fileType, headerIds, isYamlFile]);

  const flatTocItems = useMemo(() => {
    if (isYamlFile) {
      // For YAML, items are already flat
      return tocItems;
    }
    return flattenTOC(tocItems);
  }, [tocItems, isYamlFile]);

  // Handle item collapse/expand
  const toggleCollapse = (id: string, hasChildren: boolean) => {
    if (!hasChildren) return;

    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle click to scroll to section
  const handleItemClick = (id: string, lineNumber?: number) => {
    // For YAML files in editor mode, scroll to line number
    if (isYamlFile && lineNumber && onScrollToLine) {
      onScrollToLine(lineNumber);
      return;
    }

    // For Markdown or YAML viewer mode, scroll to element
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  };

  // No file loaded
  if (!currentFile) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400 ${className}`}
      >
        <FileText className="h-8 w-8 mb-2" />
        <p className="text-sm text-center">No file selected</p>
      </div>
    );
  }

  // No headers/comments found
  if (tocItems.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400 ${className}`}
      >
        {isYamlFile ? (
          <MessageSquare className="h-8 w-8 mb-2" />
        ) : (
          <Hash className="h-8 w-8 mb-2" />
        )}
        <p className="text-sm text-center">
          {isYamlFile ? 'No comments found' : 'No headers found'}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {isYamlFile ? (
            <MessageSquare className="h-4 w-4" />
          ) : (
            <Hash className="h-4 w-4" />
          )}
          {isYamlFile ? 'Outline (Comments)' : 'Table of Contents'}
        </h3>
      </div>

      {/* TOC Items */}
      <div className="p-1">
        {flatTocItems.map((item, index) => {
          const hasChildren = item.children.length > 0;
          const isCollapsed = collapsedItems.has(item.id);

          // Check if this item should be hidden due to a collapsed parent
          let shouldHide = false;
          for (let i = index - 1; i >= 0; i--) {
            const previousItem = flatTocItems[i];
            if (
              previousItem.depth !== undefined && item.depth !== undefined &&
              previousItem.depth < item.depth &&
              collapsedItems.has(previousItem.id)
            ) {
              shouldHide = true;
              break;
            }
            if (previousItem.depth !== undefined && item.depth !== undefined && previousItem.depth <= item.depth) break;
          }

          if (shouldHide) return null;

          return (
            <div key={item.id} className="group">
              <div
                className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  item.depth !== undefined && item.depth > 0 ? 'ml-' + item.depth * 4 : ''
                }`}
                style={{ marginLeft: `${(item.depth || 0) * 16}px` }}
                onClick={() => handleItemClick(item.id, (item as any).lineNumber)}
              >
                {hasChildren && (
                  <button
                    className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    onClick={e => {
                      e.stopPropagation();
                      toggleCollapse(item.id, hasChildren);
                    }}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                )}

                {!hasChildren && <div className="w-4 flex-shrink-0" />}

                {/* Show line number for YAML comments */}
                {isYamlFile && (item as any).lineNumber && (
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0">
                    {(item as any).lineNumber}
                  </span>
                )}

                <div
                  className={`flex-1 text-xs leading-tight truncate transition-colors ${
                    item.level === 1
                      ? 'font-semibold text-gray-900 dark:text-gray-100'
                      : item.level === 2
                        ? 'font-medium text-gray-800 dark:text-gray-200'
                        : 'text-gray-700 dark:text-gray-300'
                  } group-hover:text-primary-600 dark:group-hover:text-primary-400`}
                  title={item.text}
                >
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableOfContents;
