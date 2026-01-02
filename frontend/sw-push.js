/**
 * Service Worker para Push Notifications - Flores Victoria
 * Maneja notificaciones push en segundo plano
 */

// Versión del cache
const CACHE_VERSION = 'flores-victoria-v1';
const NOTIFICATION_ICON = '/img/logo-icon.png';
const BADGE_ICON = '/img/badge.png';

// Evento de instalación
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker instalado');
    self.skipWaiting();
});

// Evento de activación
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activado');
    event.waitUntil(clients.claim());
});

// Evento de push notification
self.addEventListener('push', (event) => {
    console.log('📩 Push notification recibida');

    let data = {};
    
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = {
            notification: {
                title: 'Flores Victoria',
                body: event.data?.text() || 'Nueva notificación'
            }
        };
    }

    const notification = data.notification || {};
    const notificationData = data.data || {};

    const title = notification.title || 'Flores Victoria 🌸';
    const options = {
        body: notification.body || 'Tienes una nueva notificación',
        icon: notification.icon || NOTIFICATION_ICON,
        badge: notification.badge || BADGE_ICON,
        tag: notificationData.tag || `notification-${Date.now()}`,
        data: notificationData,
        requireInteraction: notificationData.requireInteraction || false,
        vibrate: [200, 100, 200],
        actions: getActionsForType(notificationData.type),
        // Imagen grande (si está disponible)
        image: notification.image
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Obtiene acciones según el tipo de notificación
function getActionsForType(type) {
    const actionsMap = {
        order: [
            { action: 'view', title: 'Ver pedido', icon: '/icons/view.png' },
            { action: 'track', title: 'Rastrear', icon: '/icons/track.png' }
        ],
        cart: [
            { action: 'view_cart', title: 'Ver carrito', icon: '/icons/cart.png' },
            { action: 'dismiss', title: 'Más tarde', icon: '/icons/later.png' }
        ],
        promotion: [
            { action: 'view_promotion', title: 'Ver oferta', icon: '/icons/offer.png' },
            { action: 'dismiss', title: 'No gracias', icon: '/icons/dismiss.png' }
        ],
        chat: [
            { action: 'reply', title: 'Responder', icon: '/icons/reply.png' },
            { action: 'dismiss', title: 'Cerrar', icon: '/icons/close.png' }
        ],
        loyalty: [
            { action: 'view_points', title: 'Ver puntos', icon: '/icons/points.png' },
            { action: 'dismiss', title: 'OK', icon: '/icons/ok.png' }
        ]
    };

    return actionsMap[type] || [
        { action: 'open', title: 'Abrir', icon: '/icons/open.png' }
    ];
}

// Evento de clic en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Clic en notificación:', event.notification.tag);
    
    event.notification.close();

    const data = event.notification.data || {};
    const action = event.action;

    let url = '/';

    // Determinar URL según acción y tipo
    if (action === 'view' || action === 'view_order') {
        url = data.orderId ? `/account/orders/${data.orderId}` : '/account/orders';
    } else if (action === 'track' || action === 'track_delivery') {
        url = data.orderId ? `/tracking/${data.orderId}` : '/tracking';
    } else if (action === 'view_cart') {
        url = '/cart';
    } else if (action === 'view_promotion') {
        url = data.promotionId ? `/promotions/${data.promotionId}` : '/promotions';
    } else if (action === 'reply' || action === 'open_chat') {
        url = '/chat';
    } else if (action === 'view_points') {
        url = '/account/loyalty';
    } else if (action === 'view_subscription') {
        url = data.subscriptionId ? `/account/subscriptions/${data.subscriptionId}` : '/account/subscriptions';
    } else if (action === 'redeem_reward') {
        url = '/account/rewards';
    } else if (action === 'dismiss') {
        return; // No hacer nada
    } else {
        // URL por defecto según tipo
        url = getDefaultUrl(data.type, data);
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Buscar ventana existente
                for (const client of clientList) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                // Abrir nueva ventana
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// URL por defecto según tipo de notificación
function getDefaultUrl(type, data) {
    const urlMap = {
        order: data.orderId ? `/account/orders/${data.orderId}` : '/account/orders',
        cart: '/cart',
        promotion: '/promotions',
        flash_sale: data.productId ? `/products/${data.productId}` : '/products',
        subscription: '/account/subscriptions',
        loyalty: '/account/loyalty',
        chat: '/chat',
        welcome: '/',
        birthday: '/account/rewards'
    };

    return urlMap[type] || '/';
}

// Evento de cierre de notificación
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Notificación cerrada:', event.notification.tag);
    
    // Opcional: Tracking de notificaciones cerradas
    const data = event.notification.data || {};
    
    // Enviar evento a analytics (si está configurado)
    if (data.trackingId) {
        fetch('/api/analytics/notification-closed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notificationId: data.trackingId,
                type: data.type,
                closedAt: new Date().toISOString()
            })
        }).catch(() => {}); // Ignorar errores
    }
});

// Evento de suscripción push cambió
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('🔄 Suscripción push cambió');
    
    event.waitUntil(
        self.registration.pushManager.subscribe({ userVisibleOnly: true })
            .then((subscription) => {
                // Notificar al servidor sobre la nueva suscripción
                return fetch('/api/notifications/push/subscription-changed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oldEndpoint: event.oldSubscription?.endpoint,
                        newSubscription: subscription.toJSON()
                    })
                });
            })
    );
});

// Mensaje desde la aplicación
self.addEventListener('message', (event) => {
    console.log('💬 Mensaje recibido:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
    console.log('🔄 Sync event:', event.tag);

    if (event.tag === 'sync-notifications') {
        event.waitUntil(syncPendingNotifications());
    }
});

async function syncPendingNotifications() {
    // Sincronizar notificaciones pendientes cuando hay conexión
    try {
        const cache = await caches.open('pending-notifications');
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const data = await response.json();
            
            await fetch('/api/notifications/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            await cache.delete(request);
        }
    } catch (error) {
        console.error('Error sincronizando notificaciones:', error);
    }
}
