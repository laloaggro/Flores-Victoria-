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
  '/offline.html'
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
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver la respuesta del cache si existe
      if (response) {
        return response;
      }

      // Si no está en cache, hacer la solicitud a la red
      return fetch(event.request).catch((error) => {
        console.error('Error al obtener el recurso:', error);

        // Si la solicitud es para una imagen y falla, devolver una imagen de marcador de posición
        if (event.request.destination === 'image') {
          return caches.match('/assets/images/placeholder.svg');
        }
      });
    })
  );
});
