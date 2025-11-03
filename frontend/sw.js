// sw.js - Service Worker Optimizado con Estrategias de Caching Avanzadas
// Versión: 2.0.0

const CACHE_VERSION = '2.0.0';
const CACHE_PREFIX = 'flores-victoria';

// Nombres de caché por estrategia
const CACHES = {
  static: `${CACHE_PREFIX}-static-v${CACHE_VERSION}`,
  dynamic: `${CACHE_PREFIX}-dynamic-v${CACHE_VERSION}`,
  images: `${CACHE_PREFIX}-images-v${CACHE_VERSION}`,
  api: `${CACHE_PREFIX}-api-v${CACHE_VERSION}`,
};

// Recursos a pre-cachear (críticos)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  
  // CSS crítico
  '/css/base.css',
  '/css/style.css',
  '/css/design-system.css',
  '/css/fixes.css',
  
  // JS crítico
  '/js/main.js',
  '/js/utils/image-optimizer.js',
  '/js/utils/cls-optimizer.js',
  
  // Iconos y manifest
  '/favicon.png',
  '/manifest.json',
];

// Configuración de timeouts
const TIMEOUT = {
  network: 3000, // 3 segundos max para network requests
  cache: 500,    // 500ms max para cache reads
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Instalando Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHES.static)
      .then((cache) => {
        console.log('[SW] 📥 Pre-cacheando recursos críticos');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] ✅ Pre-caché completado');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] ❌ Error en pre-caché:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] 🔄 Activando Service Worker v' + CACHE_VERSION);
  
  const cacheWhitelist = Object.values(CACHES);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_PREFIX) && !cacheWhitelist.includes(cacheName)) {
            console.log('[SW] 🗑️ Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => {
      console.log('[SW] ✅ Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptación de solicitudes con estrategias avanzadas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip: non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip: Chrome extensions
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Estrategia para API: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHES.api, TIMEOUT.network));
    return;
  }

  // Estrategia para imágenes: Stale While Revalidate
  if (/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, CACHES.images));
    return;
  }

  // Estrategia para CSS/JS: Cache First
  if (/\.(css|js|woff2?|ttf|eot)$/i.test(url.pathname) || 
      /fonts\.(googleapis|gstatic)\.com/.test(url.origin)) {
    event.respondWith(cacheFirst(request, CACHES.static));
    return;
  }

  // Estrategia para HTML: Network First
  if (/\.html$/.test(url.pathname) || request.destination === 'document') {
    event.respondWith(networkFirst(request, CACHES.dynamic, TIMEOUT.network));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirst(request, CACHES.dynamic, TIMEOUT.network));
});

// ============================================================================
// ESTRATEGIAS DE CACHING
// ============================================================================

/**
 * Cache First: Busca en caché primero, red como fallback
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] 📥 Cacheado:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] ❌ Error fetch:', error);
    throw error;
  }
}

/**
 * Network First: Red primero, caché como fallback
 */
async function networkFirst(request, cacheName, timeout) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetchWithTimeout(request, timeout);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] 📦 Fallback caché:', request.url);
      return cached;
    }

    // Fallback para páginas HTML
    if (request.destination === 'document') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }

    throw error;
  }
}

/**
 * Stale While Revalidate: Usa caché, actualiza en background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Actualizar caché en background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignorar errores en background update
  });

  // Retornar caché inmediatamente si existe
  return cached || fetchPromise;
}

/**
 * Fetch con timeout
 */
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

console.log('[SW] 🚀 Service Worker v' + CACHE_VERSION + ' cargado');
