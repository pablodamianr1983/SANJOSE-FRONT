import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
  'import.meta.env.VITE_API_URL': JSON.stringify('https://sanjose-back-production.up.railway.app')
},
  server: {
    proxy: {
      '/api': {
        target: 'https://sanjose-back-production.up.railway.app', // ✅ Asegúrate de incluir HTTPS
        changeOrigin: true,
        secure: true
      }
    }
  }
});
