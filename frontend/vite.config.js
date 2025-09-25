import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('Proxy error: ' + err.message);
            });
          }
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
    // Directorio de archivos estáticos
    publicDir: resolve(__dirname, 'assets'),
    // Configuración para evitar problemas de permisos en contenedores
    cacheDir: '/tmp/vite-cache',
  };
});