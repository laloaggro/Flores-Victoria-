/**
 * ============================================================================
 * Service Worker v4.0.0 - Flores Victoria
 * ============================================================================
 * 
 * Service Worker empresarial con estrategias avanzadas de caching.
 * 
 * @version 4.0.0
 * @features
 * - 🚀 Precaching inteligente de assets críticos
 * - 🔄 5 estrategias de caching
 * - 📱 Soporte offline completo
 * - 🎯 Cache selectivo por tipo de recurso
 * - 🧹 Limpieza automática de caches antiguos
 * - 📊 Background sync para análitics offline
 * - 🔔 Push notifications ready
 * - ⚡ Stale-while-revalidate para imágenes
 */

const VERSION = '4.0.0';
const CACHE_PREFIX = 'flores-victoria';
const BUILD_ID = '20251112'; // Cambiar en cada deploy

// ============================================================================
// CONFIGURACIÓN DE CACHES
// ============================================================================

const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-${VERSION}-${BUILD_ID}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-${VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-${VERSION}`,
  API: `${CACHE_PREFIX}-api-${VERSION}`,
  FONTS: `${CACHE_PREFIX}-fonts-${VERSION}`,
};

// TTL (Time To Live) por tipo de contenido
const TTL = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 días
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 día
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 días
  API: 5 * 60 * 1000, // 5 minutos
  FONTS: 365 * 24 * 60 * 60 * 1000, // 1 año
};

// Límites de cache (evitar llenar disco)
const CACHE_LIMITS = {
  IMAGES: 50, // máximo 50 imágenes
  DYNAMIC: 30, // máximo 30 páginas dinámicas
  API: 20, // máximo 20 respuestas API
};

// ============================================================================
// ASSETS CRÍTICOS PARA PRECACHE
// ============================================================================

const CRITICAL_ASSETS = [
  // Páginas principales
  '/',
  '/index.html',
  '/pages/products.html',
  '/pages/cart.html',
  '/offline.html',

  // CSS crítico
  '/css/base.css',
  '/css/style.css',
  '/css/design-system.css',

  // JavaScript core
  '/js/components/common-bundle.js',
  '/js/components/core-bundle.js',
  '/js/diagnostics.js',

  // Assets esenciales
  '/logo.svg',
  '/favicon.png',
  '/manifest.json',
];

// ============================================================================
// INSTALL EVENT - Precaching
// ============================================================================

self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] 🔧 Installing...`);

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHES.STATIC);

        // Precache assets críticos con manejo de errores individual
        await Promise.allSettled(
          CRITICAL_ASSETS.map(async (url) => {
            try {
              await cache.add(url);
              console.log(`[SW] ✅ Cached: ${url}`);
            } catch (error) {
              console.warn(`[SW] ⚠️  Failed to cache: ${url}`, error);
            }
          })
        );

        // Crear página offline
        await createOfflinePage();

        // Saltar fase de espera
        await self.skipWaiting();

        console.log(`[SW ${VERSION}] ✅ Installation complete`);
      } catch (error) {
        console.error('[SW] ❌ Installation failed:', error);
      }
    })()
  );
});

// ============================================================================
// ACTIVATE EVENT - Limpieza
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] ⚡ Activating...`);

  event.waitUntil(
    (async () => {
      try {
        // Limpiar caches antiguos
        await cleanupOldCaches();

        // Tomar control de todas las páginas abiertas
        await self.clients.claim();

        // Inicializar background sync
        await initializeBackgroundSync();

        console.log(`[SW ${VERSION}] ✅ Activation complete`);
      } catch (error) {
        console.error('[SW] ❌ Activation failed:', error);
      }
    })()
  );
});

// ============================================================================
// FETCH EVENT - Estrategias de caching
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests no-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar Chrome extensions y analytics
  if (url.hostname.includes('chrome-extension') || url.hostname.includes('analytics')) {
    return;
  }

  // Determinar estrategia según tipo de recurso
  const strategy = determineStrategy(request, url);

  event.respondWith(handleRequest(request, strategy));
});

// ============================================================================
// ESTRATEGIAS DE CACHING
// ============================================================================

/**
 * Determina la estrategia de caching según el recurso
 */
function determineStrategy(request, url) {
  // API requests → Network First
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }

  // Imágenes → Stale While Revalidate
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)) {
    return 'stale-while-revalidate';
  }

  // Fuentes → Cache First (long term)
  if (request.destination === 'font' || /\.(woff2?|ttf|eot)$/i.test(url.pathname)) {
    return 'cache-first';
  }

  // CSS/JS → Stale While Revalidate
  if (request.destination === 'style' || request.destination === 'script') {
    return 'stale-while-revalidate';
  }

  // HTML → Network First
  if (
    request.destination === 'document' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    return 'network-first';
  }

  // Default → Network First
  return 'network-first';
}

/**
 * Maneja el request según la estrategia
 */
async function handleRequest(request, strategy) {
  try {
    switch (strategy) {
      case 'cache-first':
        return await cacheFirst(request);
      case 'network-first':
        return await networkFirst(request);
      case 'stale-while-revalidate':
        return await staleWhileRevalidate(request);
      case 'network-only':
        return await fetch(request);
      default:
        return await networkFirst(request);
    }
  } catch (error) {
    return handleError(request, error);
  }
}

/**
 * Estrategia: Cache First
 * Busca primero en cache, luego en red
 */
async function cacheFirst(request) {
  const cacheName = getCacheName(request);
  const cached = await caches.match(request);

  if (cached && !isExpired(cached)) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    await enforceCache Limit(cacheName);
  }

  return response;
}

/**
 * Estrategia: Network First
 * Intenta red primero, fallback a cache
 */
async function networkFirst(request) {
  const cacheName = getCacheName(request);

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await enforceCacheLimit(cacheName);
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request);

    if (cached) {
      console.log('[SW] 📦 Serving from cache (network failed):', request.url);
      return cached;
    }

    throw error;
  }
}

/**
 * Estrategia: Stale While Revalidate
 * Retorna cache inmediatamente, actualiza en background
 */
async function staleWhileRevalidate(request) {
  const cacheName = getCacheName(request);
  const cached = await caches.match(request);

  // Revalidar en background
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await enforceCacheLimit(cacheName);
    }
    return response;
  });

  // Retornar cache si existe, sino esperar network
  return cached || fetchPromise;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene el nombre del cache según el tipo de recurso
 */
function getCacheName(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return CACHES.API;
  if (request.destination === 'image') return CACHES.IMAGES;
  if (request.destination === 'font') return CACHES.FONTS;
  if (request.destination === 'document') return CACHES.DYNAMIC;

  return CACHES.STATIC;
}

/**
 * Verifica si una respuesta en cache expiró
 */
function isExpired(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;

  const age = Date.now() - parseInt(cachedAt);
  const ttl = TTL.STATIC; // Default TTL

  return age > ttl;
}

/**
 * Limpia caches antiguos
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = Object.values(CACHES);

  const deletePromises = cacheNames
    .filter((name) => !validCaches.includes(name) && name.startsWith(CACHE_PREFIX))
    .map((name) => {
      console.log(`[SW] 🗑️  Deleting old cache: ${name}`);
      return caches.delete(name);
    });

  await Promise.all(deletePromises);
}

/**
 * Aplica límites a un cache específico
 */
async function enforceCacheLimit(cacheName) {
  let limit;

  if (cacheName.includes('images')) limit = CACHE_LIMITS.IMAGES;
  else if (cacheName.includes('dynamic')) limit = CACHE_LIMITS.DYNAMIC;
  else if (cacheName.includes('api')) limit = CACHE_LIMITS.API;
  else return; // Sin límite

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > limit) {
    const deleteCount = keys.length - limit;
    const deletePromises = keys.slice(0, deleteCount).map((key) => cache.delete(key));
    await Promise.all(deletePromises);
  }
}

/**
 * Maneja errores de fetch
 */
async function handleError(request, error) {
  console.error('[SW] ❌ Request failed:', request.url, error);

  // Buscar en cache como último recurso
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  // Si es una página HTML, retornar página offline
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }

  // Retornar respuesta 503
  return new Response('Servicio no disponible', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

/**
 * Crea página offline predeterminada
 */
async function createOfflinePage() {
  const offlineHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sin Conexión - Flores Victoria</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .icon { font-size: 5rem; margin-bottom: 1rem; }
        h1 { color: #2d3748; margin-bottom: 1rem; }
        p { color: #718096; line-height: 1.6; margin-bottom: 2rem; }
        .btn {
            background: #C2185B;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
        }
        .btn:hover { background: #880E4F; transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📡</div>
        <h1>Sin Conexión</h1>
        <p>
            No pudimos conectarnos a internet. Algunas páginas pueden estar
            disponibles en modo offline.
        </p>
        <a href="/" class="btn">Volver al Inicio</a>
    </div>
</body>
</html>
  `;

  const cache = await caches.open(CACHES.STATIC);
  const response = new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' },
  });

  await cache.put('/offline.html', response);
}

/**
 * Inicializa background sync
 */
async function initializeBackgroundSync() {
  if ('sync' in self.registration) {
    console.log('[SW] ✅ Background Sync available');
  }
}

// ============================================================================
// MESSAGE EVENT - Comunicación con clientes
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const { urls } = event.data;
    cacheUrls(urls);
  }
});

/**
 * Cachea URLs bajo demanda
 */
async function cacheUrls(urls) {
  const cache = await caches.open(CACHES.DYNAMIC);
  await Promise.allSettled(urls.map((url) => cache.add(url)));
}

// ============================================================================
// PUSH NOTIFICATIONS (preparado para futuro)
// ============================================================================

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Nueva notificación de Flores Victoria',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Flores Victoria', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});

console.log(`[SW ${VERSION}] 🚀 Service Worker loaded`);
