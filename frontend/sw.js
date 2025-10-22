// sw.js - Service Worker para caché de recursos

const CACHE_NAME = 'arreglos-victoria-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/products.html',
  '/contact.html',
  '/about.html',
  '/assets/css/styles.css',
  '/assets/css/header.css',
  '/assets/css/theme.css',
  '/assets/css/conflict-fixes.css',
  '/assets/css/visibility-fix.css',
  '/assets/css/accessibility.css',
  '/assets/js/main-app.js',
  '/assets/js/userMenu.js',
  '/assets/js/theme.js',
  '/assets/js/utils.js',
  '/assets/js/cartUtils.js',
  '/assets/js/errorHandler.js',
  '/components/Header.js',
  '/components/Footer.js',
  '/components/ProductCard.js',
  '/assets/images/default-avatar.svg',
  '/assets/images/logo.png',
  '/assets/images/about-florist.jpg',
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
