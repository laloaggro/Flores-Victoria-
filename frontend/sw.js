/**
 * Service Worker - Flores Victoria
 * Estrategia de caching optimizada para performance
 * Version: 2.0.2
 */

const CACHE_VERSION = 'flores-victoria-v2.0.2';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Recursos para pre-cachear (solo archivos locales garantizados)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Recursos opcionales para cachear (no fallar si no existen)
const OPTIONAL_ASSETS = [
  '/pages/products.html',
  '/css/bundle.css',
  '/css/style.css',
  '/assets/mock/products.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Límites de cache
const CACHE_LIMITS = {
  images: 100,
  dynamic: 50,
};

// =====================================================
// INSTALL - Cachear recursos estáticos
// =====================================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');

  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then(async (cache) => {
        console.log('📦 Pre-cacheando recursos estáticos');
        
        // Cachear recursos obligatorios
        try {
          await cache.addAll(STATIC_ASSETS);
          console.log('✅ Recursos obligatorios cacheados');
        } catch (err) {
          console.warn('⚠️ Error cacheando recursos obligatorios:', err);
        }
        
        // Cachear recursos opcionales uno por uno (no fallar si alguno falla)
        for (const url of OPTIONAL_ASSETS) {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn(`⚠️ No se pudo cachear (opcional): ${url}`);
          }
        }
        
        return Promise.resolve();
      })
      .then(() => {
        console.log('✅ Service Worker instalado');
        return self.skipWaiting(); // Activar inmediatamente
      })
  );
});

// =====================================================
// ACTIVATE - Limpiar caches antiguos
// =====================================================
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activando...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches de versiones anteriores
            if (
              cacheName.startsWith('flores-victoria-') &&
              cacheName !== CACHE_STATIC &&
              cacheName !== CACHE_DYNAMIC &&
              cacheName !== CACHE_IMAGES
            ) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado');
        return self.clients.claim(); // Tomar control inmediato
      })
  );
});

// =====================================================
// FETCH - Estrategias de caching por tipo de recurso
// =====================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests GET del mismo origen
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Estrategia por tipo de recurso
  if (isIconRequest(request)) {
    // Iconos PWA - cache agresivo
    event.respondWith(cacheFirstStatic(request));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirstImages(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStatic(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstAPI(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// =====================================================
// ESTRATEGIAS DE CACHING
// =====================================================

/**
 * Cache First - Para imágenes
 * Prioriza cache, fallback a red
 */
async function cacheFirstImages(request) {
  const cache = await caches.open(CACHE_IMAGES);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      // Cachear si es exitosa
      await cache.put(request, response.clone());
      await limitCacheSize(CACHE_IMAGES, CACHE_LIMITS.images);
    }

    return response;
  } catch (error) {
    console.error('Error fetching image:', error);
    // Retornar placeholder si falla
    return new Response(
      '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><rect fill="#f0f0f0" width="300" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="#999">⚠️ Sin conexión</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Cache First - Para assets estáticos (CSS, JS, fonts)
 * Cache tiene prioridad absoluta
 */
async function cacheFirstStatic(request) {
  const cache = await caches.open(CACHE_STATIC);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Error fetching static asset:', error);
    throw error;
  }
}

/**
 * Network First - Para API requests
 * Red primero, fallback a cache
 */
async function networkFirstAPI(request) {
  const cache = await caches.open(CACHE_DYNAMIC);

  try {
    const response = await fetch(request, {
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      await cache.put(request, response.clone());
      await limitCacheSize(CACHE_DYNAMIC, CACHE_LIMITS.dynamic);
    }

    return response;
  } catch (error) {
    console.warn('Red no disponible, usando cache:', error);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Stale While Revalidate - Para páginas HTML
 * Sirve cache inmediatamente, actualiza en background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const cached = await cache.match(request);

  // Fetch en paralelo
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached); // Fallback a cache si falla

  // Retornar cache inmediatamente si existe, sino esperar fetch
  return cached || fetchPromise;
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Detectar si es request de icono PWA
 */
function isIconRequest(request) {
  return request.url.includes('/icons/') || request.url.includes('manifest.json');
}

/**
 * Detectar si es request de imagen
 */
function isImageRequest(request) {
  return (
    request.destination === 'image' || /\.(png|jpg|jpeg|gif|svg|webp|avif)$/i.test(request.url)
  );
}

/**
 * Detectar si es asset estático
 */
function isStaticAsset(request) {
  return (
    /\.(css|js|woff2?|ttf|eot)$/i.test(request.url) ||
    request.url.includes('/css/') ||
    request.url.includes('/js/')
  );
}

/**
 * Detectar si es request de API
 */
function isAPIRequest(request) {
  return (
    request.url.includes('/api/') ||
    request.url.includes('/assets/mock/') ||
    request.url.includes('.json')
  );
}

/**
 * Limitar tamaño del cache
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Eliminar las más antiguas (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
    console.log(`🧹 Cache ${cacheName} limpiado: ${toDelete.length} items eliminados`);
  }
}

// =====================================================
// MENSAJES DESDE LA APLICACIÓN
// =====================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName.startsWith('flores-victoria-')) {
                return caches.delete(cacheName);
              }
            })
          );
        })
        .then(() => {
          console.log('🗑️ Todos los caches eliminados');
        })
    );
  }
});

// =====================================================
// SYNC EN BACKGROUND (opcional)
// =====================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  // Implementar sincronización del carrito cuando vuelva la conexión
  console.log('🔄 Sincronizando carrito...');
}

console.log('🚀 Service Worker cargado - Versión', CACHE_VERSION);
