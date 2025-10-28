import { resolve } from 'path';

import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
    },
    root: './',
    publicDir: 'public',
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '3.0.0'),
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:3000/api'),
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      sourcemap: mode === 'development',
      // Use default esbuild minifier to avoid terser dependency in containers
      minify: mode === 'production' ? true : false,
      // ✅ OPTIMIZACIÓN: Reducir tamaño de chunks
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          products: resolve(__dirname, 'pages/products.html'),
          about: resolve(__dirname, 'pages/about.html'),
          contact: resolve(__dirname, 'pages/contact.html'),
          cart: resolve(__dirname, 'pages/cart.html'),
          checkout: resolve(__dirname, 'pages/checkout.html'),
          catalog: resolve(__dirname, 'pages/catalog.html'),
          devErrors: resolve(__dirname, 'pages/dev/errors.html'),
        },
        output: {
          // ✅ OPTIMIZACIÓN: Code splitting inteligente
          manualChunks(id) {
            // Separar vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            // Separar componentes
            if (id.includes('/js/components/')) {
              return 'components';
            }
            // Separar utilidades
            if (id.includes('/js/utils/') || id.includes('/js/config/')) {
              return 'utils';
            }
          },
          // ✅ OPTIMIZACIÓN: Nombres consistentes para mejor caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
});
