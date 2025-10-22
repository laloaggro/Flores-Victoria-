/**
 * Service Worker para Arreglos Victoria
 * Proporciona funcionalidad offline básica y mejora el rendimiento mediante caching
 */

const CACHE_VERSION = 'v1.0.4';
const CACHE_NAME = `arreglos-victoria-${CACHE_VERSION}`;
const DEBUG = self.location.hostname === 'localhost'; // Solo debug en desarrollo

// Recursos estáticos críticos para cachear durante la instalación
// NOTA: NO incluir páginas HTML dinámicas que puedan tener rutas cambiantes
const STATIC_ASSETS = [
  '/',
  '/index.html',
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
  if (DEBUG) console.log('[SW] 📦 Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        if (DEBUG) console.log('[SW] 📥 Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
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
      // Solo log en desarrollo (reduce ruido en consola)
      if (self.location.hostname === 'localhost') {
        console.debug('[SW] ⚡ Cache:', url.pathname);
      }
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
          console.warn('[SW] ⚠️ MIME type incorrecto para JS:', url.pathname, contentType);
          return networkResponse;
        }
        
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        
        if (self.location.hostname === 'localhost') {
          console.debug('[SW] 📥 Cacheado:', url.pathname);
        }
      } else {
        console.debug('[SW] ⏭️ No cacheable:', url.pathname, contentType);
      }
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] ❌ Error:', error.message);
    
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
