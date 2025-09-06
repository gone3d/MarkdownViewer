import { useMemo } from 'react';
import { useAppContext } from './contexts/AppContext';
import { useAutoSave } from './hooks/useAutoSave';
import { useFileTree } from './hooks/useFileTree';
import { precomputeHeaderIds } from './utils/slugify';
import Header from './components/Header';
import AppShell from './components/AppShell';
import Footer from './components/Footer';
import './index.css';

function App() {
  const {
    state,
    loadFile,
    saveFile,
    updateFileContent,
    setViewMode,
    toggleSidebar,
    toggleTheme,
    openFile,
  } = useAppContext();

  // Remove the separate theme hook since we're using AppContext
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


  const handleFileSelect = async (filePath: string) => {
    // For now, just log the selection
    console.log('File selected:', filePath);
  };

  const handleFileOpen = async (filePath: string) => {
    try {
      // First try to get the file from the current file tree
      const file = await fileTree.loadFileById(filePath);

      if (file) {
        // File found in current tree - load it directly
        await loadFile(file);
        console.log('Successfully loaded file from current tree:', filePath);
      } else {
        // File not found in current tree - try to access it directly if supported
        console.log('File not in current tree, attempting direct access:', filePath);
        
        if ('showOpenFilePicker' in window) {
          try {
            // For recent files, we can try to guide the user to the specific file
            const fileName = filePath.split('/').pop() || filePath;
            console.log(`Opening file picker for: ${fileName}`);
            
            // Open file picker - user will need to navigate to the file
            await openFile();
          } catch (pickerError) {
            console.error('File picker was cancelled or failed:', pickerError);
          }
        } else {
          // Fallback for browsers without File System Access API
          const fileName = filePath.split('/').pop() || filePath;
          alert(`Cannot access file "${fileName}" directly. Please use the Open File button to select it manually.`);
        }
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


  // Convert context state to legacy format for components that haven't been updated yet
  const currentFile = state.currentFile ? state.currentFile.file : null;
  const isLoading = state.globalLoading || (state.currentFile?.isLoading ?? false);
  const error = state.globalError || (state.currentFile?.error ?? null);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        sidebarOpen={state.sidebarOpen}
        onToggleSidebar={toggleSidebar}
        viewMode={state.viewMode}
        onViewModeChange={setViewMode}
        isDarkMode={state.theme === 'dark'}
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
        onFileLoad={loadFile}
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