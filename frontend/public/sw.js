/**
 * Service Worker para Flores Victoria
 * Proporciona caching estratégico y funcionalidad offline
 */

const CACHE_NAME = 'flores-victoria-v1.0.0';
const STATIC_CACHE = 'flores-victoria-static-v1.0.0';
const DYNAMIC_CACHE = 'flores-victoria-dynamic-v1.0.0';

// Archivos estáticos para cache inmediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/style.css',
  '/css/design-system.css',
  '/css/fixes.css',
  '/css/components.css',
  '/js/main.js',
];

// Archivos críticos que siempre deben estar disponibles
const CRITICAL_PAGES = [
  '/',
  '/index.html',
  '/pages/products.html',
  '/pages/contact.html',
  '/pages/about.html',
];

// Instalación del Service Worker
globalThis.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return globalThis.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación:', error);
      })
  );
});

// Activación del Service Worker
globalThis.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguas
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => {
        console.log('✅ Service Worker: Activación completada');
        return globalThis.clients.claim();
      })
  );
});

// Manejo de peticiones fetch
globalThis.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo manejar peticiones HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategia Cache First para archivos estáticos
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia Network First para páginas HTML
  if (isHTMLPage(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia Stale While Revalidate para imágenes
  if (isImage(request.url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Estrategia Network First para API calls
  if (isAPICall(request.url)) {
    event.respondWith(networkFirstWithTimeout(request, 3000));
    return;
  }

  // Por defecto: Network First
  event.respondWith(networkFirst(request));
});

// Estrategias de caching

/**
 * Cache First: Busca primero en cache, luego en red
 * Ideal para archivos estáticos que no cambian frecuentemente
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache First Error:', error);
    return new Response('Recurso no disponible', { status: 404 });
  }
}

/**
 * Network First: Intenta red primero, luego cache
 * Ideal para contenido que cambia frecuentemente
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Página offline de respaldo
    if (isHTMLPage(request)) {
      return createOfflinePage();
    }

    return new Response('Contenido no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network First con timeout
 * Útil para APIs que pueden ser lentas
 */
async function networkFirstWithTimeout(request, timeout = 3000) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), timeout)),
    ]);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network with timeout failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Service temporarily unavailable', { status: 503 });
  }
}

/**
 * Stale While Revalidate: Devuelve cache y actualiza en background
 * Ideal para imágenes y recursos que pueden estar desactualizados
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Actualizar en background
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Devolver cache inmediatamente si está disponible
  return cachedResponse || networkResponsePromise;
}

// Funciones de utilidad

function isStaticAsset(url) {
  return /\.(css|js|woff|woff2|ttf|ico)$/i.test(url);
}

function isHTMLPage(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

function isAPICall(url) {
  return url.includes('/api/') || url.includes('/wp-json/');
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🌺 Sin Conexión - Flores Victoria</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fdf2f8, #fce7f3);
          color: #374151;
          text-align: center;
        }
        .offline-container {
          max-width: 500px;
          padding: 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .offline-message {
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .retry-button {
          background: linear-gradient(135deg, #f43f5e, #ec4899);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .retry-button:hover {
          transform: translateY(-1px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🌺</div>
        <h1 class="offline-title">Sin Conexión</h1>
        <p class="offline-message">
          No tienes conexión a internet en este momento. 
          Algunas funciones pueden no estar disponibles.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Intentar de Nuevo
        </button>
      </div>
    </body>
    </html>
  `;

  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' },
  });
}

// Manejo de actualizaciones en background
globalThis.addEventListener('backgroundsync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Service Worker: Ejecutando sincronización en background');

  try {
    // Sincronizar datos pendientes cuando hay conexión
    const pendingData = await getStoredData('pending-sync');

    if (pendingData && pendingData.length > 0) {
      for (const item of pendingData) {
        await syncData(item);
      }

      // Limpiar datos sincronizados
      await clearStoredData('pending-sync');
      console.log('✅ Service Worker: Sincronización completada');
    }
  } catch (error) {
    console.error('❌ Service Worker: Error en sincronización:', error);
  }
}

// Notificaciones push (para futuras implementaciones)
globalThis.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.url,
      actions: [
        {
          action: 'open',
          title: 'Ver',
        },
        {
          action: 'close',
          title: 'Cerrar',
        },
      ],
    };

    event.waitUntil(globalThis.registration.showNotification(data.title, options));
  }
});

globalThis.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});

// Utilidades para almacenamiento local
async function getStoredData(key) {
  // Implementar almacenamiento en IndexedDB si es necesario
  return null;
}

async function clearStoredData(key) {
  // Implementar limpieza de almacenamiento
}

async function syncData(item) {
  // Implementar lógica de sincronización
  console.log('Syncing:', item);
}

// Manejo de errores globales
globalThis.addEventListener('error', (event) => {
  console.error('❌ Service Worker Error:', event.error);
});

globalThis.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker Unhandled Rejection:', event.reason);
});

console.log('🌺 Service Worker: Cargado correctamente');
