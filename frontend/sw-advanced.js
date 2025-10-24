/**
 * Advanced Service Worker - Flores Victoria PWA 3.0
 * Comprehensive offline support and advanced caching
 * Open Source Project - MIT License
 */

const CACHE_NAME = 'flores-victoria-v3.0.0';
const STATIC_CACHE = 'flores-victoria-static-v3.0.0';
const DYNAMIC_CACHE = 'flores-victoria-dynamic-v3.0.0';
const IMAGE_CACHE = 'flores-victoria-images-v3.0.0';
const API_CACHE = 'flores-victoria-api-v3.0.0';

// Cache configurations
const CACHE_CONFIG = {
  static: {
    maxEntries: 100,
    maxAgeSeconds: 86400 * 30, // 30 days
  },
  dynamic: {
    maxEntries: 50,
    maxAgeSeconds: 86400 * 7, // 7 days
  },
  images: {
    maxEntries: 200,
    maxAgeSeconds: 86400 * 30, // 30 days
  },
  api: {
    maxEntries: 100,
    maxAgeSeconds: 3600, // 1 hour
  },
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/responsive.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/cart.js',
  '/js/catalog.js',
  '/js/notifications.js',
  '/js/pwa-advanced.js',
  '/js/wasm-processor.js',
  '/js/ai-recommendations.js',
  '/js/chatbot.js',
  '/images/logo.png',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png',
  '/manifest.json',
  '/offline.html',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/recommendations',
  '/api/user/profile',
];

// Background sync tags
const SYNC_TAGS = {
  CART_SYNC: 'cart-sync',
  ORDER_SYNC: 'order-sync',
  FAVORITES_SYNC: 'favorites-sync',
  REVIEW_SYNC: 'review-sync',
  IMAGE_UPLOAD_SYNC: 'image-upload-sync',
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_NAME);

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('Service Worker: Pre-caching API endpoints');
        return Promise.all(
          API_ENDPOINTS.map((endpoint) =>
            fetch(endpoint)
              .then((response) => {
                if (response.ok) {
                  return cache.put(endpoint, response);
                }
              })
              .catch((error) => {
                console.warn(`Failed to pre-cache ${endpoint}:`, error);
              })
          )
        );
      }),
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', CACHE_NAME);

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
    ]).then(() => {
      console.log('Service Worker: Activation complete');
    })
  );
});

// Fetch event - Advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Route requests to appropriate cache strategies
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  switch (event.tag) {
    case SYNC_TAGS.CART_SYNC:
      event.waitUntil(syncCart());
      break;
    case SYNC_TAGS.ORDER_SYNC:
      event.waitUntil(syncOrders());
      break;
    case SYNC_TAGS.FAVORITES_SYNC:
      event.waitUntil(syncFavorites());
      break;
    case SYNC_TAGS.REVIEW_SYNC:
      event.waitUntil(syncReviews());
      break;
    case SYNC_TAGS.IMAGE_UPLOAD_SYNC:
      event.waitUntil(syncImageUploads());
      break;
    default:
      console.warn('Unknown sync tag:', event.tag);
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  let notificationData = {
    title: 'Flores Victoria',
    body: 'You have a new notification',
    icon: '/images/icons/icon-192.png',
    badge: '/images/icons/badge-72.png',
    tag: 'default',
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        actions: getNotificationActions(notificationData.type),
        requireInteraction: notificationData.requireInteraction || false,
        silent: notificationData.silent || false,
        vibrate: notificationData.vibrate || [200, 100, 200],
      }),
      // Log notification for analytics
      logNotification(notificationData),
    ])
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification.tag);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = '/';

  // Determine target URL based on notification type
  switch (notificationData.type) {
    case 'order_update':
      targetUrl = `/orders/${notificationData.orderId}`;
      break;
    case 'promotion':
      targetUrl = notificationData.url || '/promotions';
      break;
    case 'product_available':
      targetUrl = `/products/${notificationData.productId}`;
      break;
    case 'cart_reminder':
      targetUrl = '/cart';
      break;
    default:
      targetUrl = notificationData.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message event - Communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_CACHE_STATS':
      event.ports[0].postMessage(getCacheStats());
      break;
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName).then((success) => {
        event.ports[0].postMessage({ success });
      });
      break;
    case 'SYNC_DATA':
      requestBackgroundSync(payload.tag);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      console.log('Cache hit:', request.url);
      return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await manageCacheSize(cacheName);
    }

    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return getOfflineResponse(request);
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await manageCacheSize(cacheName);
    }

    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return getOfflineResponse(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
      manageCacheSize(cacheName);
    }
    return response;
  });

  return cached || (await fetchPromise);
}

// Cache management
async function manageCacheSize(cacheName) {
  const config = getCacheConfig(cacheName);
  if (!config) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > config.maxEntries) {
    const excessKeys = keys.slice(0, keys.length - config.maxEntries);
    await Promise.all(excessKeys.map((key) => cache.delete(key)));
  }

  // Clean expired entries
  const now = Date.now();
  const expiredKeys = [];

  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > config.maxAgeSeconds * 1000) {
          expiredKeys.push(key);
        }
      }
    }
  }

  await Promise.all(expiredKeys.map((key) => cache.delete(key)));
}

function getCacheConfig(cacheName) {
  if (cacheName.includes('static')) return CACHE_CONFIG.static;
  if (cacheName.includes('dynamic')) return CACHE_CONFIG.dynamic;
  if (cacheName.includes('images')) return CACHE_CONFIG.images;
  if (cacheName.includes('api')) return CACHE_CONFIG.api;
  return null;
}

// Background sync functions
async function syncCart() {
  try {
    const pendingItems = await getStoredData('pendingCartItems');
    if (!pendingItems || pendingItems.length === 0) return;

    for (const item of pendingItems) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    }

    await clearStoredData('pendingCartItems');
    console.log('Cart sync completed');
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

async function syncOrders() {
  try {
    const pendingOrders = await getStoredData('pendingOrders');
    if (!pendingOrders || pendingOrders.length === 0) return;

    for (const order of pendingOrders) {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        await removeStoredData('pendingOrders', order.id);
      }
    }

    console.log('Orders sync completed');
  } catch (error) {
    console.error('Orders sync failed:', error);
  }
}

async function syncFavorites() {
  try {
    const pendingFavorites = await getStoredData('pendingFavorites');
    if (!pendingFavorites || pendingFavorites.length === 0) return;

    for (const favorite of pendingFavorites) {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favorite),
      });
    }

    await clearStoredData('pendingFavorites');
    console.log('Favorites sync completed');
  } catch (error) {
    console.error('Favorites sync failed:', error);
  }
}

async function syncReviews() {
  try {
    const pendingReviews = await getStoredData('pendingReviews');
    if (!pendingReviews || pendingReviews.length === 0) return;

    for (const review of pendingReviews) {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (response.ok) {
        await removeStoredData('pendingReviews', review.id);
      }
    }

    console.log('Reviews sync completed');
  } catch (error) {
    console.error('Reviews sync failed:', error);
  }
}

async function syncImageUploads() {
  try {
    const pendingUploads = await getStoredData('pendingImageUploads');
    if (!pendingUploads || pendingUploads.length === 0) return;

    for (const upload of pendingUploads) {
      const formData = new FormData();
      formData.append('image', upload.blob);
      formData.append('metadata', JSON.stringify(upload.metadata));

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await removeStoredData('pendingImageUploads', upload.id);
      }
    }

    console.log('Image uploads sync completed');
  } catch (error) {
    console.error('Image uploads sync failed:', error);
  }
}

// Utility functions
function isStaticAsset(url) {
  return (
    url.pathname.includes('/css/') ||
    url.pathname.includes('/js/') ||
    url.pathname.includes('/images/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  );
}

function isImageRequest(url) {
  return (
    url.pathname.includes('/uploads/') ||
    url.pathname.includes('/product-images/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)
  );
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function getOfflineResponse(request) {
  if (isNavigationRequest(request)) {
    return caches.match('/offline.html');
  }

  if (isImageRequest(new URL(request.url))) {
    return caches.match('/images/offline-image.png');
  }

  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' },
  });
}

function getNotificationActions(type) {
  switch (type) {
    case 'order_update':
      return [
        { action: 'view', title: 'Ver pedido' },
        { action: 'dismiss', title: 'Cerrar' },
      ];
    case 'promotion':
      return [
        { action: 'view', title: 'Ver oferta' },
        { action: 'later', title: 'Más tarde' },
      ];
    case 'product_available':
      return [
        { action: 'buy', title: 'Comprar ahora' },
        { action: 'view', title: 'Ver producto' },
      ];
    default:
      return [];
  }
}

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = {
      entries: keys.length,
      urls: keys.map((key) => key.url),
    };
  }

  return stats;
}

async function clearCache(cacheName) {
  if (cacheName) {
    return await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    const results = await Promise.all(cacheNames.map((name) => caches.delete(name)));
    return results.every((result) => result === true);
  }
}

function requestBackgroundSync(tag) {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    });
  }
}

// IndexedDB helpers for background sync
async function getStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FloresVictoriaOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function clearStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FloresVictoriaOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve(true);
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

async function removeStoredData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FloresVictoriaOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function logNotification(notificationData) {
  try {
    await fetch('/api/analytics/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: notificationData.type,
        tag: notificationData.tag,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.warn('Failed to log notification:', error);
  }
}

console.log('Flores Victoria Service Worker v3.0.0 loaded successfully');
