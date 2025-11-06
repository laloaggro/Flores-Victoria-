/**
 * Service Worker - Flores Victoria
 * Estrategia de cache para mejor performance y soporte offline
 *
 * Estrategias:
 * - Cache First: CSS, JS, imágenes (actualizadas en background)
 * - Network First: HTML, API (con fallback a cache)
 * - Stale While Revalidate: Fonts, datos dinámicos
 */

const CACHE_VERSION = 'flores-victoria-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Archivos esenciales para precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/critical.css',
  '/css/main.css',
  '/js/components/common-bundle.js',
  '/js/components/header-component.js',
  '/js/components/footer-component.js',
  '/manifest.json',
  '/favicon.ico',
];

// Límites de cache
const CACHE_LIMITS = {
  images: 50,
  dynamic: 30,
};

// === INSTALACIÓN ===
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Pre-cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error en instalación:', error);
      })
  );
});

// === ACTIVACIÓN ===
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                // Eliminar caches antiguos
                cacheName.startsWith('flores-victoria-') &&
                cacheName !== CACHE_STATIC &&
                cacheName !== CACHE_DYNAMIC &&
                cacheName !== CACHE_IMAGES
            )
            .map((cacheName) => {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        )
      )
      .then(() => {
        console.log('[SW] Activación completada');
        return self.clients.claim();
      })
  );
});

// === FETCH STRATEGY ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip para requests non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Skip para requests externos (excepto CDNs conocidos)
  if (url.origin !== location.origin && !isTrustedCDN(url.origin)) {
    return;
  }

  // Aplicar estrategia según tipo de recurso
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_IMAGES, CACHE_LIMITS.images));
  } else if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_STATIC));
  } else if (isHTMLRequest(request)) {
    event.respondWith(networkFirstStrategy(request, CACHE_DYNAMIC));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request, CACHE_DYNAMIC));
  }
});

// === ESTRATEGIAS DE CACHE ===

/**
 * Cache First - Prioriza cache, actualiza en background
 * Ideal para: CSS, JS, imágenes
 */
async function cacheFirstStrategy(request, cacheName, limit = null) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Retornar desde cache
      // Actualizar en background si no es muy reciente
      if (shouldRevalidate(cachedResponse)) {
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
              limitCacheSize(cacheName, limit);
            }
          })
          .catch(() => {});
      }
      return cachedResponse;
    }

    // Si no está en cache, fetch y guardar
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      limitCacheSize(cacheName, limit);
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache First error:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First - Prioriza red, fallback a cache
 * Ideal para: HTML, API
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      limitCacheSize(cacheName, CACHE_LIMITS.dynamic);
    }

    return response;
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si es HTML, mostrar página offline
    if (isHTMLRequest(request)) {
      return caches.match('/offline.html');
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale While Revalidate - Retorna cache mientras actualiza
 * Ideal para: Fonts, datos que cambian ocasionalmente
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
        limitCacheSize(cacheName, CACHE_LIMITS.dynamic);
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// === UTILIDADES ===

function isImageRequest(request) {
  return request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

function isStaticAsset(request) {
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    /\.(js|css|woff2|woff|ttf)$/i.test(request.url)
  );
}

function isHTMLRequest(request) {
  return request.destination === 'document' || request.headers.get('Accept')?.includes('text/html');
}

function isTrustedCDN(origin) {
  const trustedCDNs = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ];
  return trustedCDNs.some((cdn) => origin.startsWith(cdn));
}

function shouldRevalidate(response) {
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl && cacheControl.includes('immutable')) {
    return false;
  }

  const date = response.headers.get('Date');
  if (!date) return true;

  const age = Date.now() - new Date(date).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas

  return age > maxAge;
}

async function limitCacheSize(cacheName, limit) {
  if (!limit) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > limit) {
    const toDelete = keys.length - limit;
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// === MENSAJES ===
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
    );
  }
});
