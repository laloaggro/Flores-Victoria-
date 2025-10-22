/**
 * Service Worker para Arreglos Victoria
 * Proporciona funcionalidad offline básica y mejora el rendimiento mediante caching
 */

const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `arreglos-victoria-${CACHE_VERSION}`;

// Recursos estáticos críticos para cachear durante la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/products.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/css/design-system.css',
  '/css/base.css',
  '/css/style.css',
  '/logo.svg',
  '/manifest.json'
];

// Recursos que se cachearán en tiempo de ejecución
const RUNTIME_CACHE = [
  '/js/components-loader.js',
  '/js/image-optimizer.js',
  '/js/accessibility-enhancer.js'
];

// URLs externas que NO deben cachearse
const EXTERNAL_URLS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com'
];

/**
 * Evento de instalación del Service Worker
 * Cachea recursos estáticos críticos
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[SW] Error durante la instalación:', error);
      })
  );
});

/**
 * Evento de activación del Service Worker
 * Limpia cachés antiguos
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activación completada');
        return self.clients.claim(); // Tomar control inmediatamente
      })
  );
});

/**
 * Evento de fetch - Estrategia: Cache First con Network Fallback
 * Para recursos estáticos usa cache primero, para API usa network primero
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar solicitudes que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar solicitudes a dominios externos de fuentes/CDN
  if (EXTERNAL_URLS.some(externalUrl => url.href.startsWith(externalUrl))) {
    return event.respondWith(fetch(request));
  }

  // Estrategia para solicitudes a la API (Network First)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estrategia para recursos estáticos (Cache First)
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Estrategia Cache First - Para recursos estáticos
 * Intenta servir desde cache, si falla va a red
 */
async function cacheFirstStrategy(request) {
  try {
    // Ignorar chrome-extension y otras URLs no cacheables
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:' || 
        url.protocol === 'moz-extension:' || 
        url.protocol === 'safari-extension:') {
      console.log('[SW] Ignorando extensión:', request.url);
      return fetch(request);
    }

    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Sirviendo desde caché:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Descargando desde red:', request.url);
    const networkResponse = await fetch(request);

    // Cachear respuesta exitosa solo si es cacheable
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cacheFirstStrategy:', error);
    
    // Retornar página offline si está disponible
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Última opción: respuesta de error genérica
    return new Response('Sin conexión', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Estrategia Network First - Para datos de API
 * Intenta red primero, si falla usa cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear respuesta exitosa de API
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, intentando caché para:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'Sin conexión' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Evento de mensaje - Para comunicación con la página
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urls))
    );
  }
});

console.log('[SW] Service Worker cargado');
