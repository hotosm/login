import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import HOTOSM auth web component
import '@hotosm/hanko-auth';

// Import and register Hanko Profile component
import { register } from '@teamhanko/hanko-elements';

// Set global HANKO_URL for the web component
window.HANKO_URL = import.meta.env.VITE_HANKO_URL || 'http://login.localhost';

// Register Hanko elements (for hanko-profile)
register(window.HANKO_URL).catch((error) => {
  console.error('Failed to register Hanko elements:', error);
});

console.log('🔧 Hanko URL configured:', window.HANKO_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
