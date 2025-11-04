import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import HOTOSM auth web component
import '../auth-libs/web-component/dist/hanko-auth.esm.js';

// Set global HANKO_URL for the web component
window.HANKO_URL = import.meta.env.VITE_HANKO_URL || 'http://login.localhost';

console.log('🔧 Hanko URL configured:', window.HANKO_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
