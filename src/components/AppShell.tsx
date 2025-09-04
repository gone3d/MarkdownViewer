import React, { useState } from 'react';
import { ViewMode, SidebarMode, MarkdownFile } from '../types/markdown';
import { useFileTree } from '../hooks/useFileTree';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';

interface AppShellProps {
  sidebarOpen: boolean;
  viewMode: ViewMode;
  currentFile: MarkdownFile | null;
  isLoading: boolean;
  error: string | null;
  onFileSelect?: (filePath: string) => void;
  onFileOpen?: (filePath: string) => void;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  fileTree?: ReturnType<typeof useFileTree>;
  headerIds?: Map<string, string>;
}

const AppShell: React.FC<AppShellProps> = ({
  sidebarOpen,
  viewMode,
  currentFile,
  isLoading,
  error,
  onFileSelect,
  onFileOpen,
  onContentChange,
  onSave,
  fileTree,
  headerIds,
}) => {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('files');

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <Sidebar
            mode={sidebarMode}
            onModeChange={setSidebarMode}
            currentFile={currentFile}
            onFileSelect={onFileSelect}
            onFileOpen={onFileOpen}
            fileTree={fileTree}
            headerIds={headerIds}
          />
        </aside>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-hidden">
        <ContentArea
          currentFile={currentFile}
          viewMode={viewMode}
          isLoading={isLoading}
          error={error}
          onContentChange={onContentChange}
          onSave={onSave}
          headerIds={headerIds}
          className="h-full"
        />
      </main>
    </div>
  );
};

export default AppShell;