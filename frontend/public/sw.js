/**
 * Service Worker para Arreglos Victoria v2.2
 * Proporciona funcionalidad offline avanzada y mejora el rendimiento mediante caching inteligente
 */

const CACHE_VERSION = 'v2.2.0';
const CACHE_NAME = `arreglos-victoria-${CACHE_VERSION}`;
const STATIC_CACHE = 'static-v2.2';
const DYNAMIC_CACHE = 'dynamic-v2.2';
const DEBUG = true; // Habilitado para desarrollo

// Recursos estáticos críticos para cachear durante la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/catalog.html',
  '/pages/products.html',
  '/pages/contact.html',
  '/css/design-system.css',
  '/css/base.css',
  '/css/style.css',
  '/css/fixes.css',
  '/js/performance-optimizer.js',
  '/js/image-optimizer.js',
  '/js/seo-optimizer.js',
  '/logo.svg',
  '/manifest.json',
  '/favicon.png'
];

// Recursos dinámicos
const DYNAMIC_PATTERNS = [
  '/api/',
  '/images/',
  '/uploads/'
];

// URLs externas que NO deben cachearse
const EXTERNAL_URLS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://maps.googleapis.com',
  'https://maps.gstatic.com'
];

/**
 * Evento de instalación del Service Worker
 * Cachea recursos estáticos críticos de forma tolerante a fallos
 */
self.addEventListener('install', (event) => {
  if (DEBUG) console.log('[SW] 📦 Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        if (DEBUG) console.log('[SW] 📥 Cacheando recursos estáticos');
        
        // Cachear cada recurso individualmente, ignorando fallos
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              if (DEBUG) console.log('[SW] ✅ Cacheado:', url);
            } else {
              if (DEBUG) console.log('[SW] ⏭️ Omitido (no disponible):', url);
            }
          } catch (error) {
            if (DEBUG) console.log('[SW] ⏭️ Omitido (error):', url);
          }
        });
        
        await Promise.allSettled(cachePromises);
        if (DEBUG) console.log('[SW] ✅ Instalación completada');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[SW] ❌ Error durante la instalación:', error);
      })
  );
});

/**
 * Evento de activación del Service Worker
 * Limpia cachés antiguos
 */
self.addEventListener('activate', (event) => {
  if (DEBUG) console.log('[SW] 🔄 Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              if (DEBUG) console.log('[SW] 🗑️ Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        if (DEBUG) console.log('[SW] ✅ Activación completada');
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
      return fetch(request);
    }

    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Cache hit - sin logging para evitar spam en consola
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Validar que la respuesta sea cacheable antes de guardar
    if (networkResponse && networkResponse.status === 200) {
      const contentType = networkResponse.headers.get('Content-Type') || '';
      const isJavaScript = contentType.includes('javascript') || 
                          contentType.includes('application/json');
      const isCSS = contentType.includes('css');
      const isImage = contentType.includes('image');
      const isFont = contentType.includes('font');
      const isHTML = contentType.includes('html');
      
      // Solo cachear archivos con MIME type correcto
      if (isJavaScript || isCSS || isImage || isFont || isHTML) {
        // Verificar que módulos JS tengan el MIME type correcto
        if (url.pathname.endsWith('.js') && !isJavaScript) {
          // console.warn('[SW] ⚠️ MIME type incorrecto para JS:', url.pathname, contentType);
          return networkResponse;
        }
        
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        
        if (DEBUG) {
          // console.log('[SW] 📥 Cacheado:', url.pathname);
        }
      } else if (DEBUG) {
        // console.log('[SW] ⏭️ No cacheable:', url.pathname, contentType);
      }
    }

    return networkResponse;
  } catch (error) {
    // No mostrar error en consola para recursos opcionales o de desarrollo
    const url = new URL(request.url);
    const isOptionalResource = url.pathname.includes('lazy-load-observer') || 
                               url.pathname.includes('.map') ||
                               url.pathname.includes('hot-update');
    
    if (!isOptionalResource) {
      console.warn('[SW] ⚠️ Fetch falló:', url.pathname, error.message);
    }
    
    // Para navegación HTML, retornar página offline si está disponible
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Para recursos opcionales, retornar respuesta vacía exitosa
    if (isOptionalResource) {
      return new Response('', {
        status: 200,
        statusText: 'OK (Optional Resource)',
        headers: new Headers({
          'Content-Type': 'application/javascript'
        })
      });
    }
    
    // Para otros recursos, retornar error 503
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
    // console.log('[SW] Red no disponible, intentando caché para:', request.url);
    
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
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
      return; // No usar event.ports para evitar message channel errors
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
      const urls = event.data.urls || [];
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(urls))
          .catch(error => console.warn('[SW] Cache error:', error))
      );
      return; // No usar event.ports para evitar message channel errors
    }
  } catch (error) {
    // console.warn('[SW] Message handler error:', error);
  }
});

// console.log('[SW] Service Worker cargado');
