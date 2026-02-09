import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import HOTOSM auth web component
import '@hotosm/hanko-auth';

// Import and register Hanko Profile component with translations
import { register } from '@teamhanko/hanko-elements';
import { en } from '@teamhanko/hanko-elements/i18n/en';
import { es } from '/auth-libs-src/src/hanko-i18n-es';
import { fr } from '/auth-libs-src/src/hanko-i18n-fr';
import { pt } from '/auth-libs-src/src/hanko-i18n-pt';

// Set global HANKO_URL for the web component
window.HANKO_URL = import.meta.env.VITE_HANKO_URL || 'http://login.localhost';

// Register Hanko elements with translations (for hanko-profile)
register(window.HANKO_URL, {
  translations: { en, es, fr, pt },
  fallbackLanguage: 'en',
}).catch((error) => {
  console.error('Failed to register Hanko elements:', error);
});

console.log('🔧 Hanko URL configured:', window.HANKO_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
