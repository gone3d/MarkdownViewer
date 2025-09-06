import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppProvider } from './contexts/AppContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </SettingsProvider>
  </StrictMode>
);
