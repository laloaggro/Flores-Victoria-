import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets'),
    },
  },
  // Configuración para servir archivos estáticos
  publicDir: 'assets',
  // Configuración para evitar problemas de permisos en contenedores
  cacheDir: '/tmp/vite-cache'
});