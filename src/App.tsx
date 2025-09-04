import { useMemo } from 'react';
import { useAppContext } from './contexts/AppContext';
import { useAutoSave } from './hooks/useAutoSave';
import { useTheme } from './hooks/useTheme';
import { useFileTree } from './hooks/useFileTree';
import { precomputeHeaderIds } from './utils/slugify';
import Header from './components/Header';
import AppShell from './components/AppShell';
import Footer from './components/Footer';
import './index.css';

function App() {
  const {
    state,
    openFile,
    loadFile,
    saveFile,
    updateFileContent,
    setViewMode,
    toggleSidebar,
    toggleTheme,
  } = useAppContext();

  const { actualTheme } = useTheme();
  const fileTree = useFileTree();

  // Pre-compute header IDs for synchronization between TOC and Viewer
  const headerIds = useMemo(() => {
    return state.currentFile?.file.content
      ? precomputeHeaderIds(state.currentFile.file.content)
      : new Map();
  }, [state.currentFile?.file.content]);

  // Auto-save functionality - only enabled when there are unsaved changes
  const autoSave = useAutoSave({
    interval: 60000, // 60 seconds
    enabled: !!state.currentFile && 
             state.viewMode !== 'viewer' && 
             (state.currentFile?.hasUnsavedChanges ?? false), // Only when there are unsaved changes
    onSave: () => saveFile(),
    content: state.currentFile?.file.content || '',
    lastSaveTime: state.currentFile?.lastSaveTime || null,
  });

  const handleOpenFile = async () => {
    await openFile();
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
        // Load the file using the context
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
    updateFileContent(content); // Let context auto-detect changes
  };

  const handleSave = async (content: string) => {
    try {
      await saveFile(content);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleHeaderSave = async () => {
    if (state.currentFile) {
      await handleSave(state.currentFile.file.content);
    }
  };

  // Convert context state to legacy format for components that haven't been updated yet
  const currentFile = state.currentFile ? state.currentFile.file : null;
  const isLoading = state.globalLoading || (state.currentFile?.isLoading ?? false);
  const error = state.globalError || (state.currentFile?.error ?? null);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        sidebarOpen={state.sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onOpenFile={handleOpenFile}
        onSave={handleHeaderSave}
        hasFile={!!state.currentFile}
        viewMode={state.viewMode}
        onViewModeChange={setViewMode}
        isDarkMode={actualTheme === 'dark'}
        onThemeToggle={toggleTheme}
      />
      <AppShell
        sidebarOpen={state.sidebarOpen}
        viewMode={state.viewMode}
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
      <Footer 
        currentFile={currentFile} 
        autoSave={autoSave} 
      />
    </div>
  );
}

export default App;