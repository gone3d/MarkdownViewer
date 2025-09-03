import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileText, Hash } from 'lucide-react';
import { MarkdownFile } from '../types/markdown';
import { extractTableOfContents, flattenTOC } from '../utils/tocExtractor';

interface TableOfContentsProps {
  currentFile: MarkdownFile | null;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  currentFile, 
  className = '' 
}) => {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  // Extract TOC from current file
  const tocItems = useMemo(() => {
    if (!currentFile?.content) return [];
    return extractTableOfContents(currentFile.content);
  }, [currentFile?.content]);

  const flatTocItems = useMemo(() => flattenTOC(tocItems), [tocItems]);

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
  const handleItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // No file loaded
  if (!currentFile) {
    return (
      <div className={`flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400 ${className}`}>
        <FileText className="h-8 w-8 mb-2" />
        <p className="text-sm text-center">No file selected</p>
      </div>
    );
  }

  // No headers found
  if (tocItems.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400 ${className}`}>
        <Hash className="h-8 w-8 mb-2" />
        <p className="text-sm text-center">No headers found</p>
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Table of Contents
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
            if (previousItem.depth < item.depth && collapsedItems.has(previousItem.id)) {
              shouldHide = true;
              break;
            }
            if (previousItem.depth <= item.depth) break;
          }

          if (shouldHide) return null;

          return (
            <div key={item.id} className="group">
              <div
                className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  item.depth > 0 ? 'ml-' + (item.depth * 4) : ''
                }`}
                style={{ marginLeft: `${item.depth * 16}px` }}
                onClick={() => handleItemClick(item.id)}
              >
                {hasChildren && (
                  <button
                    className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    onClick={(e) => {
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
                
                {!hasChildren && (
                  <div className="w-4 flex-shrink-0" />
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