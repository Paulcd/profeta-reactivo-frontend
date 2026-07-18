import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend corre en :3000 (dev). El backend FastAPI en :8000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
  },
});
