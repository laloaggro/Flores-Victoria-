// sw.js - Service Worker para caché de recursos

const CACHE_NAME = 'arreglos-victoria-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/products.html',
  // CSS Files (actual structure)
  '/css/style.css',
  '/css/base.css',
  '/css/components.css',
  '/css/design-system.css',
  '/css/fixes.css',
  '/css/responsive-test.css',
  // JS Files (actual structure)
  '/js/main.js',
  '/js/api.js',
  '/js/pwa-advanced.js',
  '/js/chatbot.js',
  '/js/ai-recommendations.js',
  '/js/health.js',
  '/js/system-advanced.js',
  '/js/wasm-processor.js',
  // Components
  '/js/components/',
  // Images
  '/favicon.ico',
  // Offline page
  '/offline.html',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  // Realiza la precarga de recursos
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Interceptación de solicitudes
self.addEventListener('fetch', (event) => {
  try {
    const url = new URL(event.request.url);

    // Bypass: no interceptar llamadas a API, métodos no-GET o cross-origin
    const isApi = url.pathname.startsWith('/api/');
    const isGet = event.request.method === 'GET';
    const isSameOrigin = url.origin === self.location.origin;
    if (isApi || !isGet || !isSameOrigin) {
      return; // Allow default network handling
    }

    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).catch((error) => {
          console.error('Error al obtener el recurso:', error);

          // Si la solicitud es para una imagen y falla, devolver una imagen de marcador de posición
          if (event.request.destination === 'image') {
            return caches.match('/assets/images/placeholder.svg');
          }

          // Para navegaciones, ofrecer página offline si existe
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          // Como último recurso, devolver una respuesta de error clara
          return new Response('Recurso no disponible sin conexión', { status: 503 });
        });
      })
    );
  } catch (e) {
    // En caso de error inesperado, no bloquear la solicitud
    console.error('SW fetch handler error:', e);
  }
});
