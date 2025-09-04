import { useState, useMemo } from 'react';
import { ViewMode } from './types/markdown';
import { useMarkdownFile } from './hooks/useMarkdownFile';
import { useTheme } from './hooks/useTheme';
import { useFileTree } from './hooks/useFileTree';
import { precomputeHeaderIds } from './utils/slugify';
import Header from './components/Header';
import AppShell from './components/AppShell';
import Footer from './components/Footer';
import './index.css';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('viewer');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentFile, isLoading, error, openFile, loadFile, saveFile, updateContent } = useMarkdownFile();
  const { actualTheme, toggleTheme } = useTheme();
  const fileTree = useFileTree();

  // Pre-compute header IDs for synchronization between TOC and Viewer
  const headerIds = useMemo(() => {
    return currentFile?.content ? precomputeHeaderIds(currentFile.content) : new Map();
  }, [currentFile?.content]);

  const handleOpenFile = async () => {
    await openFile();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFileSelect = async (filePath: string) => {
    // For now, just log the selection
    console.log('File selected:', filePath);
  };

  const handleFileOpen = async (filePath: string) => {
    try {
      // Get the file from the file tree using its ID (path)
      const file = await fileTree.loadFileById(filePath);
      
      if (file) {
        // Load the file using the markdown file hook
        await loadFile(file);
        console.log('Successfully loaded file:', filePath);
      } else {
        console.error('Failed to load file:', filePath);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleContentChange = (content: string) => {
    updateContent(content);
  };

  const handleSave = async (content: string) => {
    try {
      await saveFile(content);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onOpenFile={handleOpenFile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isDarkMode={actualTheme === 'dark'}
        onThemeToggle={toggleTheme}
      />
      <AppShell
        sidebarOpen={sidebarOpen}
        viewMode={viewMode}
        currentFile={currentFile}
        isLoading={isLoading}
        error={error}
        onFileSelect={handleFileSelect}
        onFileOpen={handleFileOpen}
        onContentChange={handleContentChange}
        onSave={handleSave}
        fileTree={fileTree}
        headerIds={headerIds}
      />
      <Footer currentFile={currentFile} />
    </div>
  );
}

export default App;
