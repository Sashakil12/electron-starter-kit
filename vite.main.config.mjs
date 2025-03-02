import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: [/^node:.*/],
      },
    },
    publicDir: 'resources', // This directory will be used for binary files
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
