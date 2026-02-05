import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // Base path - frontend is served at /app in both dev and production
  base: '/app',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: ['login.hotosm.test', 'localhost', '127.0.0.1', '.test', 'dev.login.hotosm.org', 'login.hotosm.org'],
    fs: {
      // Allow serving files from auth-libs source
      allow: ['/app', '/auth-libs-src'],
    },
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      host: 'login.hotosm.test',
    },
    proxy: {
      // Proxy Hanko API endpoints to the Hanko service
      '/.well-known': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/passcode': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/webauthn': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/token': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://hanko:8000',
        changeOrigin: true,
        bypass: (req) => {
          // Only proxy POST/PUT/DELETE, let frontend handle GET
          if (req.method === 'GET') {
            return req.url;
          }
        },
      },
      '/logout': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/registration': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/me': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/sessions': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      '/thirdparty': {
        target: 'http://hanko:8000',
        changeOrigin: true,
      },
      // Proxy backend API
      '/api': {
        target: 'http://login-backend:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
