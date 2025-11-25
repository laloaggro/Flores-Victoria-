import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import purgecss from '@fullhuman/postcss-purgecss';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
        clientPort: 5173,
      },
      // Proxy para evitar problemas de CORS en desarrollo
      proxy: {
        // Todas las peticiones a /api se redirigen al backend local que expone la API (auth/product, etc.)
        // En este repositorio las APIs de autenticación suelen correr en el puerto 3001 en entorno local.
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          logLevel: 'debug',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('[Proxy Request]', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('[Proxy Response]', req.method, req.url, proxyRes.statusCode);
            });
            proxy.on('error', (err, _req, _res) => {
              console.error('[Proxy Error]', err.message);
            });
          },
        },
      },
    },
    root: './',
    publicDir: 'public',
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '3.0.0'),
      // Variable usada en tiempo de build; en dev usamos proxy, pero dejar un valor razonable
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api'),
    },
    css: {
      postcss:
        mode === 'production'
          ? {
              plugins: [
                purgecss({
                  content: [
                    './index.html',
                    './pages/**/*.html',
                    './js/**/*.js',
                    './components/**/*.js',
                  ],
                  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                  safelist: {
                    // Clases dinámicas que se generan en runtime
                    standard: [
                      /^toast-/,
                      /^loading-/,
                      /^modal-/,
                      /^dropdown-/,
                      /^alert-/,
                      /^badge-/,
                      /^btn-/,
                      /^card-/,
                      'show',
                      'active',
                      'visible',
                      'hidden',
                      'open',
                      'closed',
                    ],
                    // Pseudo-selectores
                    deep: [/^:/, /^::/, /^\[/],
                    // Patrones de animaciones
                    greedy: [/^animate-/, /^transition-/, /^fade-/, /^slide-/],
                  },
                }),
              ],
            }
          : {},
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      sourcemap: mode === 'development',
      // ✅ OPTIMIZACIÓN: Minificación agresiva con terser
      minify: mode === 'production' ? 'terser' : false,
      terserOptions:
        mode === 'production'
          ? {
              compress: {
                drop_console: true, // Eliminar console.log en producción
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.debug'], // Eliminar funciones específicas
                passes: 2, // Múltiples pasadas de optimización
              },
              mangle: {
                safari10: true, // Compatibilidad Safari 10+
              },
              format: {
                comments: false, // Eliminar comentarios
              },
            }
          : {},
      cssMinify: true,
      // ✅ OPTIMIZACIÓN: Reducir tamaño de chunks
      chunkSizeWarningLimit: 500, // Advertir si chunks > 500KB
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
          // catalog entry eliminado: se usa 'products' como página unificada
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
    // ✅ PostCSS con PurgeCSS para producción
    css: {
      postcss: {
        plugins:
          mode === 'production'
            ? [
                purgecss({
                  content: [
                    './index.html',
                    './pages/**/*.html',
                    './js/**/*.js',
                    './css/**/*.css',
                  ],
                  safelist: {
                    standard: [
                      /^theme-/, // Proteger temas dinámicos
                      /^active/,
                      /^show/,
                      /^visible/,
                      /^hidden/,
                      /^modal/,
                      /^toast/,
                      /^cart/,
                      /^wishlist/,
                      /^fa-/, // Font Awesome
                      /^swiper/, // Swiper carousel
                    ],
                    deep: [/^data-/, /^aria-/],
                    greedy: [/^product-/, /^btn-/, /^card-/, /^hero-/],
                  },
                  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
                }),
              ]
            : [],
      },
    },
    plugins: [
      // 🗜️ Compresión Gzip y Brotli para producción
      mode === 'production' &&
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240, // Solo comprimir archivos > 10KB
          algorithm: 'gzip',
          ext: '.gz',
        }),
      mode === 'production' &&
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'brotliCompress',
          ext: '.br',
          compressionOptions: {
            level: 11, // Máxima compresión
          },
        }),
      // 🚀 Service Worker con Workbox
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['fonts/*.woff2', 'images/icons/*.svg'],
        manifest: {
          name: 'Flores Victoria',
          short_name: 'Flores Victoria',
          description: 'Tienda de arreglos florales premium en Santiago',
          theme_color: '#d97d54',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/images/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/images/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          // Estrategia de caché
          runtimeCaching: [
            {
              // Cache de imágenes
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
                }
              }
            },
            {
              // Cache de fuentes
              urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60 // 1 año
                }
              }
            },
            {
              // Cache de CSS y JS
              urlPattern: /\.(?:css|js)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 7 * 24 * 60 * 60 // 7 días
                }
              }
            },
            {
              // API calls - Network first
              urlPattern: /^https?:\/\/.*\/api\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60 // 5 minutos
                },
                networkTimeoutSeconds: 10
              }
            }
          ],
          // Precache de recursos críticos
          globPatterns: ['**/*.{js,css,html,woff2}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true
        }
      })
    ],
  };
});
