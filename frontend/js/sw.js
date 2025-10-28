// sw.js - Service Worker para funcionalidad offline

const CACHE_NAME = 'arreglos-victoria-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/pages/products.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/login.html',
  '/pages/register.html',
  '/assets/css/combined.css',
  '/assets/js/main.js',
  '/assets/images/hero-image.jpg',
  '/assets/images/about-florist.jpg',
  '/assets/images/logo.png',
  // Eliminamos '/assets/images/favicon.ico' de la lista
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando');

  // Realizar el cacheo de archivos importantes
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos importantes');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Todos los archivos cacheados correctamente');
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear archivos:', error);
        // Registrar qué archivo específico causó el error
        urlsToCache.forEach((url) => {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                console.warn(
                  `[Service Worker] No se puede acceder al archivo: ${url} (Status: ${response.status})`
                );
              }
            })
            .catch((err) => {
              console.warn(`[Service Worker] Error al acceder al archivo: ${url}`, err);
            });
        });
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando');

  // Limpiar cachés antiguos
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );

  // Tomar control de las páginas abiertas
  return self.clients.claim();
});

// Interceptación de solicitudes
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Interceptando solicitud:', event.request.url);

  event.respondWith(
    // Primero intentar obtener de la red
    fetch(event.request)
      .then((response) => {
        // Si la solicitud fue exitosa, actualizar el caché
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() =>
        // Si falla la red, intentar obtener del caché
        caches.match(event.request).then(
          (response) =>
            // Si no se encuentra en caché, devolver null para mostrar el error real
            response || fetch(event.request)
        )
      )
  );
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
