// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'sanjose-back-production.up.railway.app',  // URL de tu API
        changeOrigin: true,  // Cambia el origen de la solicitud al destino
        secure: false       // Permite conexiones no seguras (HTTP)
      }
    }
  }
});
