import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
    watch: {
      // Exclude log files and generated outputs from triggering HMR
      ignored: ['**/*.log', '**/graphify-out/**', '**/.wear-local/**'],
    },
  },
});
