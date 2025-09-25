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
  '/css/style.css',
  '/js/main.js',
  '/js/components/utils/userMenu.js',
  '/js/components/utils/utils.js',
  '/js/i18n/index.js',
  '/js/i18n/es.js',
  '/js/i18n/en.js',
  '/images/hero-image.jpg',
  '/images/about-florist.jpg',
  '/images/logo.png'
  // Eliminamos '/assets/images/favicon.ico' de la lista
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando');
  
  // Realizar el cacheo de archivos importantes
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando');
  
  // Limpiar cachés antiguos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control de las páginas abiertas
  return self.clients.claim();
});

// Interceptación de solicitudes
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Interceptando solicitud:', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devuelve el recurso desde cache si existe, sino hace la petición
        return response || fetch(event.request);
      })
  );
  );
});

