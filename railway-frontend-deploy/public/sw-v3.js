/**
 * Service Worker v3.0 - Arreglos Victoria
 * Implementación enterprise con estrategias avanzadas
 */

const CACHE_VERSION = 'v3.0.2';
const CACHE_PREFIX = 'arreglos-victoria';

// Caches especializados
const CACHES = {
    STATIC: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
    DYNAMIC: `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`,
    IMAGES: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
    API: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
    FONTS: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`
};

// Recursos críticos para precache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/design-system.css',
    '/css/style.css',
    '/js/performance-optimizer.js',
    '/js/image-optimizer.js',
    '/js/seo-optimizer.js',
    '/js/analytics.js',
    '/js/automated-tests.js',
    '/js/security/csp-manager.js',
    '/js/monitoring/error-tracker.js',
    '/js/monitoring/performance-budget.js',
    '/manifest.json',
    '/offline.html'
];

// TTL para diferentes tipos de contenido (en ms)
const TTL = {
    STATIC: 7 * 24 * 60 * 60 * 1000,    // 7 días
    DYNAMIC: 24 * 60 * 60 * 1000,       // 1 día
    IMAGES: 30 * 24 * 60 * 60 * 1000,   // 30 días
    API: 5 * 60 * 1000,                 // 5 minutos
    FONTS: 365 * 24 * 60 * 60 * 1000    // 1 año
};

/**
 * INSTALL - Precaching de recursos críticos
 */
self.addEventListener('install', event => {
    // console.log('🔧 SW v3.0: Installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(CACHES.STATIC).then(cache => {
                // console.log('📦 Precaching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            createOfflinePage(),
            self.skipWaiting()
        ])
    );
});

/**
 * ACTIVATE - Limpieza y activación
 */
self.addEventListener('activate', event => {
    // console.log('✅ SW v3.0: Activating...');
    
    event.waitUntil(
        Promise.all([
            cleanupOldCaches(),
            self.clients.claim(),
            initializeBackgroundSync()
        ])
    );
});

/**
 * FETCH - Manejo inteligente de requests
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    if (!request.url.startsWith('http')) return;
    
    const strategy = determineStrategy(request, url);
    
    event.respondWith(
        handleRequest(request, strategy)
            .catch(error => handleRequestError(request, error))
    );
});

/**
 * Determinar estrategia según recurso
 */
function determineStrategy(request, url) {
    if (url.pathname.startsWith('/api/')) return 'network-first';
    if (request.destination === 'image') return 'stale-while-revalidate';
    if (request.destination === 'font') return 'cache-first';
    if (request.destination === 'script' || request.destination === 'style') return 'stale-while-revalidate';
    if (request.destination === 'document') return 'network-first';
    if (url.origin !== self.location.origin) return 'network-first';
    
    return 'cache-first';
}

/**
 * Manejar request según estrategia
 */
async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cache-first':
            return cacheFirst(request);
        case 'network-first':
            return networkFirst(request);
        case 'stale-while-revalidate':
            return staleWhileRevalidate(request);
        default:
            return networkFirst(request);
    }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
    const cacheName = getCacheNameForRequest(request);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse)) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const responseWithTimestamp = addTimestamp(networkResponse);
            await cache.put(request, responseWithTimestamp.clone());
        }
        return networkResponse;
    } catch (error) {
        if (cachedResponse) return cachedResponse;
        throw error;
    }
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
    const cacheName = getCacheNameForRequest(request);
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const responseWithTimestamp = addTimestamp(networkResponse);
            await cache.put(request, responseWithTimestamp.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        throw error;
    }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
    const cacheName = getCacheNameForRequest(request);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const responseWithTimestamp = addTimestamp(networkResponse);
            cache.put(request, responseWithTimestamp.clone());
        }
        return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
}

/**
 * Obtener cache name según request
 */
function getCacheNameForRequest(request) {
    const url = new URL(request.url);
    
    if (request.destination === 'image') return CACHES.IMAGES;
    if (request.destination === 'font') return CACHES.FONTS;
    if (url.pathname.startsWith('/api/')) return CACHES.API;
    if (request.destination === 'document') return CACHES.DYNAMIC;
    
    return CACHES.STATIC;
}

/**
 * Agregar timestamp a respuesta
 */
function addTimestamp(response) {
    const headers = new Headers(response.headers);
    headers.set('sw-cached-at', Date.now().toString());
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}

/**
 * Verificar si respuesta está expirada
 */
function isExpired(response) {
    if (!response.headers.has('sw-cached-at')) return false;
    
    const cachedAt = parseInt(response.headers.get('sw-cached-at'));
    const now = Date.now();
    const ttl = getTTLForResponse(response);
    
    return (now - cachedAt) > ttl;
}

/**
 * Obtener TTL según respuesta
 */
function getTTLForResponse(response) {
    const url = new URL(response.url);
    
    if (url.pathname.startsWith('/api/')) return TTL.API;
    if (response.headers.get('content-type')?.includes('image')) return TTL.IMAGES;
    if (response.headers.get('content-type')?.includes('font')) return TTL.FONTS;
    
    return TTL.DYNAMIC;
}

/**
 * Manejar errores de request
 */
async function handleRequestError(request, error) {
    if (request.destination === 'document') {
        return caches.match('/offline.html');
    }
    
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle">Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    const cache = await caches.open(getCacheNameForRequest(request));
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) return cachedResponse;
    throw error;
}

/**
 * Crear página offline
 */
async function createOfflinePage() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sin Conexión - Arreglos Victoria</title>
            <style>
                body { 
                    font-family: system-ui, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #2E7D32, #4CAF50);
                    color: white;
                    text-align: center;
                }
                .container { max-width: 400px; padding: 2rem; }
                .icon { font-size: 4rem; margin-bottom: 1rem; }
                h1 { margin-bottom: 0.5rem; }
                p { margin-bottom: 2rem; opacity: 0.9; }
                button {
                    background: white;
                    color: #2E7D32;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">🌸</div>
                <h1>Sin Conexión</h1>
                <p>No hay conexión a internet. Algunas funciones están limitadas.</p>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        </body>
        </html>
    `;
    
    const cache = await caches.open(CACHES.STATIC);
    await cache.put('/offline.html', new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    }));
}

/**
 * Limpiar caches obsoletos
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = Object.values(CACHES);
    
    const deletePromises = cacheNames
        .filter(cacheName => 
            cacheName.startsWith(CACHE_PREFIX) && 
            !currentCaches.includes(cacheName)
        )
        .map(cacheName => {
            // console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
        });
    
    return Promise.all(deletePromises);
}

/**
 * Inicializar background sync
 */
async function initializeBackgroundSync() {
    if ('sync' in self.registration) {
        // console.log('🔄 Background sync initialized');
    }
}

/**
 * Background Sync
 */
self.addEventListener('sync', event => {
    // console.log('🔄 Background sync:', event.tag);
    
    switch (event.tag) {
        case 'analytics-sync':
            event.waitUntil(syncAnalytics());
            break;
        case 'error-sync':
            event.waitUntil(syncErrors());
            break;
    }
});

/**
 * Message handling
 */
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_VERSION });
            break;
        case 'CLEAR_CACHE':
            clearCache(payload.cacheName)
                .then(() => event.ports[0].postMessage({ success: true }));
            break;
    }
});

async function syncAnalytics() {
    // console.log('📊 Syncing analytics...');
}

async function syncErrors() {
    // console.log('🚨 Syncing errors...');
}

async function clearCache(cacheName) {
    return caches.delete(cacheName);
}

// console.log('🚀 Service Worker v3.0 initialized');