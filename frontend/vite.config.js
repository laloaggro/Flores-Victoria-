import { resolve } from 'path';

import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';

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
      // ✅ OPTIMIZACIÓN: Minificación agresiva
      minify: mode === 'production' ? 'esbuild' : false,
      cssMinify: true,
      // ✅ OPTIMIZACIÓN: Reducir tamaño de chunks
      chunkSizeWarningLimit: 1000,
      // ✅ OPTIMIZACIÓN: Asset inlining para archivos pequeños
      assetsInlineLimit: 4096, // 4KB - inline SVGs y pequeñas imágenes
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
          // ✅ OPTIMIZACIÓN AVANZADA: Code splitting granular v2.0
          manualChunks(id) {
            // 1. Separar dependencias de node_modules por biblioteca
            if (id.includes('node_modules')) {
              return 'vendor';
            }

            // 2. Componentes críticos (cargan en inicio)
            if (
              id.includes('/js/components/utils/userMenu.js') ||
              id.includes('/js/utils/errorMonitor.js')
            ) {
              return 'core';
            }

            // 3. Componentes de producto (lazy load)
            if (
              id.includes('/js/components/product/') ||
              id.includes('/js/components/quick-view.js') ||
              id.includes('/js/components/product-comparison.js')
            ) {
              return 'product-features';
            }

            // 4. Componentes de carrito y checkout (lazy load)
            if (id.includes('/js/components/cart/') || id.includes('/js/components/mini-cart.js')) {
              return 'cart-features';
            }

            // 5. Componentes UI/UX (lazy load)
            if (
              id.includes('/js/components/hero-carousel.js') ||
              id.includes('/js/components/testimonials-carousel.js') ||
              id.includes('/js/components/social-proof.js') ||
              id.includes('/js/components/promotion-banners.js')
            ) {
              return 'ui-components';
            }

            // 6. Analytics y monitoring (lazy load)
            if (
              id.includes('/js/analytics') ||
              id.includes('/js/components/analytics-tracker.js') ||
              id.includes('/js/components/performance-monitor.js')
            ) {
              return 'analytics';
            }

            // 7. Utilidades compartidas
            if (id.includes('/js/utils/') || id.includes('/js/config/')) {
              return 'utils';
            }

            // 8. Service Worker y PWA (lazy load)
            if (
              id.includes('/js/components/service-worker-manager.js') ||
              id.includes('/js/pwa-advanced.js')
            ) {
              return 'pwa';
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
    // ✅ OPTIMIZACIÓN: Compresión Gzip y Brotli
    plugins:
      mode === 'production'
        ? [
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 10240, // Solo archivos > 10KB
              deleteOriginFile: false,
            }),
            viteCompression({
              algorithm: 'brotliCompress',
              ext: '.br',
              threshold: 10240,
              deleteOriginFile: false,
            }),
          ]
        : [],
  };
});
