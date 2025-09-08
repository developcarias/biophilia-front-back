import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server running on port 3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,
      },
    },
  },
});
