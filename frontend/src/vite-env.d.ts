/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HANKO_URL: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Window for global HANKO_URL
declare global {
  interface Window {
    HANKO_URL: string;
  }
}

export {};
