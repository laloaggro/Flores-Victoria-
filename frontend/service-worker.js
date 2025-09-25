// service-worker.js - Service Worker para notificaciones push

// Versión del cache
const CACHE_NAME = 'arreglos-victoria-v1.0.0';
const urlsToCache = [
  '/',
  '/pages/index.html',
  '/pages/products.html',
  '/pages/product-detail.html',
  '/pages/contact.html',
  '/pages/about.html',
  '/assets/css/combined.css',
  '/assets/js/main.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  
  // Realizar la precarga de recursos
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  
  // Limpiar cachés antiguos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptación de solicitudes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si el recurso está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está en caché, hacer la solicitud a la red
        return fetch(event.request).then((response) => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta para guardarla en caché
          const responseToCache = response.clone();
          
          // Guardar la respuesta en caché
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('Notificación push recibida:', event);
  
  let title = 'Notificación de Arreglos Victoria';
  let options = {
    body: 'Tienes una nueva notificación',
    icon: '/assets/images/logo.png',
    badge: '/assets/images/logo.png'
  };
  
  // Si hay datos en la notificación push
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    options.body = data.body || options.body;
    options.icon = data.icon || options.icon;
    options.badge = data.badge || options.badge;
    options.data = data;
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event);
  
  event.notification.close();
  
  // Si la notificación tiene datos de navegación
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Manejo de mensajes desde la aplicación principal
self.addEventListener('message', (event) => {
  console.log('Mensaje recibido en Service Worker:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification(event.data.title, event.data.options)
    );
  }
});