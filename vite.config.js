import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Microsoft-Fluent-2-Testing/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
