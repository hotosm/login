import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    target: 'es2020',
    tsconfigRaw: {
      compilerOptions: {
        useDefineForClassFields: false,
        experimentalDecorators: true
      }
    }
  },
  build: {
    target: 'es2020',
    lib: {
      entry: resolve(__dirname, 'src/hanko-auth.ts'),
      name: 'HankoAuth',
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => `hanko-auth.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      // Bundle everything for standalone use
      output: {
        inlineDynamicImports: true,
      }
    }
  },
  server: {
    open: '/examples/basic.html',
    port: 5173
  }
});
