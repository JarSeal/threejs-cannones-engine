import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    // Relative to the root (where this file is)
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
