/**
 * Cliente de Notificaciones Push - Flores Victoria
 * Maneja el registro y suscripción a push notifications
 */

class PushNotificationClient {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || '/api/notifications/push';
        this.vapidPublicKey = options.vapidPublicKey || null;
        this.serviceWorkerPath = options.serviceWorkerPath || '/sw-push.js';
        
        this.registration = null;
        this.subscription = null;
        this.isSupported = this.checkSupport();
        this.userId = null;

        console.log('🔔 Push Notification Client inicializado');
    }

    // ========================================================================
    // VERIFICACIÓN DE SOPORTE
    // ========================================================================

    checkSupport() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Workers no soportados');
            return false;
        }
        
        if (!('PushManager' in window)) {
            console.warn('⚠️ Push API no soportada');
            return false;
        }

        if (!('Notification' in window)) {
            console.warn('⚠️ Notifications API no soportada');
            return false;
        }

        return true;
    }

    // ========================================================================
    // INICIALIZACIÓN
    // ========================================================================

    /**
     * Inicializa el cliente de push notifications
     */
    async init(userId) {
        if (!this.isSupported) {
            return { success: false, reason: 'not_supported' };
        }

        this.userId = userId;

        try {
            // Registrar Service Worker
            this.registration = await navigator.serviceWorker.register(this.serviceWorkerPath);
            console.log('✅ Service Worker registrado');

            // Esperar a que esté activo
            await navigator.serviceWorker.ready;

            // Verificar suscripción existente
            this.subscription = await this.registration.pushManager.getSubscription();

            if (this.subscription) {
                console.log('📱 Suscripción existente encontrada');
                await this.syncSubscription();
            }

            return { success: true, subscribed: !!this.subscription };

        } catch (error) {
            console.error('❌ Error inicializando push:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================================================
    // PERMISOS Y SUSCRIPCIÓN
    // ========================================================================

    /**
     * Solicita permiso para notificaciones
     */
    async requestPermission() {
        if (!this.isSupported) {
            return { granted: false, reason: 'not_supported' };
        }

        const currentPermission = Notification.permission;

        if (currentPermission === 'granted') {
            return { granted: true, permission: 'granted' };
        }

        if (currentPermission === 'denied') {
            return { granted: false, permission: 'denied', reason: 'blocked' };
        }

        // Solicitar permiso
        const permission = await Notification.requestPermission();

        return {
            granted: permission === 'granted',
            permission
        };
    }

    /**
     * Suscribe al usuario a push notifications
     */
    async subscribe(options = {}) {
        if (!this.isSupported || !this.registration) {
            return { success: false, reason: 'not_initialized' };
        }

        // Verificar/solicitar permiso
        const { granted } = await this.requestPermission();
        if (!granted) {
            return { success: false, reason: 'permission_denied' };
        }

        try {
            // Opciones de suscripción
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    this.vapidPublicKey || await this.getVapidKey()
                )
            };

            // Crear suscripción
            this.subscription = await this.registration.pushManager.subscribe(subscribeOptions);
            console.log('✅ Suscrito a push notifications');

            // Registrar en el servidor
            await this.registerSubscription(options.deviceInfo);

            return { success: true, subscription: this.subscription };

        } catch (error) {
            console.error('❌ Error suscribiendo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancela la suscripción
     */
    async unsubscribe() {
        if (!this.subscription) {
            return { success: true, reason: 'not_subscribed' };
        }

        try {
            // Cancelar suscripción local
            await this.subscription.unsubscribe();

            // Notificar al servidor
            await this.unregisterSubscription();

            this.subscription = null;
            console.log('✅ Suscripción cancelada');

            return { success: true };

        } catch (error) {
            console.error('❌ Error cancelando suscripción:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica si está suscrito
     */
    isSubscribed() {
        return !!this.subscription;
    }

    /**
     * Obtiene el estado actual de permisos
     */
    getPermissionState() {
        if (!this.isSupported) return 'unsupported';
        return Notification.permission;
    }

    // ========================================================================
    // COMUNICACIÓN CON EL SERVIDOR
    // ========================================================================

    /**
     * Registra la suscripción en el servidor
     */
    async registerSubscription(deviceInfo = {}) {
        if (!this.subscription || !this.userId) return;

        const subscriptionData = this.subscription.toJSON();

        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: this.userId,
                    token: subscriptionData.endpoint,
                    deviceInfo: {
                        ...deviceInfo,
                        endpoint: subscriptionData.endpoint,
                        keys: subscriptionData.keys,
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        language: navigator.language,
                        registeredAt: new Date().toISOString()
                    }
                })
            });

            const result = await response.json();
            console.log('📱 Suscripción registrada en servidor:', result);
            return result;

        } catch (error) {
            console.error('❌ Error registrando suscripción:', error);
            throw error;
        }
    }

    /**
     * Elimina la suscripción del servidor
     */
    async unregisterSubscription() {
        if (!this.subscription || !this.userId) return;

        try {
            await fetch(`${this.apiUrl}/unregister`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userId: this.userId,
                    token: this.subscription.endpoint
                })
            });
        } catch (error) {
            console.error('❌ Error eliminando suscripción:', error);
        }
    }

    /**
     * Sincroniza la suscripción existente con el servidor
     */
    async syncSubscription() {
        if (this.userId) {
            await this.registerSubscription();
        }
    }

    /**
     * Obtiene la clave VAPID del servidor
     */
    async getVapidKey() {
        try {
            const response = await fetch(`${this.apiUrl}/vapid-key`);
            const data = await response.json();
            return data.publicKey;
        } catch (error) {
            console.error('Error obteniendo VAPID key:', error);
            // Clave de desarrollo por defecto
            return 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        }
    }

    // ========================================================================
    // NOTIFICACIONES LOCALES
    // ========================================================================

    /**
     * Muestra una notificación local
     */
    async showLocalNotification(title, options = {}) {
        if (Notification.permission !== 'granted') {
            console.warn('⚠️ No hay permiso para notificaciones');
            return;
        }

        const defaultOptions = {
            icon: '/img/logo-icon.png',
            badge: '/img/badge.png',
            vibrate: [200, 100, 200],
            requireInteraction: false
        };

        if (this.registration) {
            // Usar Service Worker para mostrar notificación
            await this.registration.showNotification(title, {
                ...defaultOptions,
                ...options
            });
        } else {
            // Fallback a Notification API
            new Notification(title, {
                ...defaultOptions,
                ...options
            });
        }
    }

    /**
     * Notificaciones predefinidas
     */
    async notifyOrderUpdate(order) {
        const messages = {
            pending: { title: '¡Pedido recibido!', body: `Tu pedido #${order.id} está siendo procesado` },
            confirmed: { title: 'Pedido confirmado', body: `Tu pedido #${order.id} ha sido confirmado` },
            preparing: { title: 'Preparando tu pedido', body: `Estamos preparando tu pedido #${order.id}` },
            shipped: { title: '¡En camino!', body: `Tu pedido #${order.id} está en camino` },
            delivered: { title: '¡Entregado!', body: `Tu pedido #${order.id} ha sido entregado` }
        };

        const msg = messages[order.status] || { title: 'Actualización de pedido', body: `Pedido #${order.id}` };
        
        await this.showLocalNotification(msg.title, {
            body: msg.body,
            tag: `order-${order.id}`,
            data: { type: 'order', orderId: order.id }
        });
    }

    async notifyPromotion(promotion) {
        await this.showLocalNotification(`¡Oferta especial! 🎉`, {
            body: `${promotion.title} - ${promotion.discount}% de descuento`,
            tag: `promo-${promotion.id}`,
            data: { type: 'promotion', promotionId: promotion.id }
        });
    }

    async notifyChatMessage(sender, message) {
        await this.showLocalNotification(`Mensaje de ${sender}`, {
            body: message.length > 100 ? message.substring(0, 97) + '...' : message,
            tag: 'chat-message',
            data: { type: 'chat' }
        });
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    /**
     * Convierte una clave Base64 URL-safe a Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    /**
     * Obtiene el token de autenticación
     */
    getAuthToken() {
        return localStorage.getItem('accessToken') || '';
    }

    /**
     * Actualiza el userId (cuando el usuario hace login)
     */
    setUserId(userId) {
        this.userId = userId;
        if (this.subscription) {
            this.syncSubscription();
        }
    }
}

// ============================================================================
// INICIALIZACIÓN GLOBAL
// ============================================================================

// Crear instancia global
window.PushNotificationClient = PushNotificationClient;

// Auto-inicializar si hay configuración
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('[data-push-notifications]');
    
    if (container) {
        const userId = container.dataset.userId || localStorage.getItem('userId');
        const vapidKey = container.dataset.vapidKey;
        
        window.pushNotifications = new PushNotificationClient({
            vapidPublicKey: vapidKey
        });

        if (userId) {
            await window.pushNotifications.init(userId);
        }
    }
});

// ============================================================================
// COMPONENTE UI PARA ACTIVAR NOTIFICACIONES
// ============================================================================

class PushNotificationButton {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.client = options.client || window.pushNotifications;
        
        if (this.container) {
            this.render();
        }
    }

    render() {
        const isSubscribed = this.client?.isSubscribed();
        const permission = this.client?.getPermissionState();

        this.container.innerHTML = `
            <div class="push-notification-toggle">
                ${permission === 'denied' ? `
                    <div class="push-blocked">
                        <span class="icon">🔕</span>
                        <span>Notificaciones bloqueadas</span>
                        <small>Actívalas en la configuración del navegador</small>
                    </div>
                ` : `
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               id="push-toggle" 
                               ${isSubscribed ? 'checked' : ''}
                               onchange="pushNotificationButton.toggle(this.checked)">
                        <span class="slider"></span>
                    </label>
                    <div class="toggle-label">
                        <span class="icon">${isSubscribed ? '🔔' : '🔕'}</span>
                        <span>${isSubscribed ? 'Notificaciones activadas' : 'Activar notificaciones'}</span>
                    </div>
                `}
            </div>
        `;
    }

    async toggle(enable) {
        if (!this.client) return;

        if (enable) {
            const result = await this.client.subscribe();
            if (!result.success) {
                // Revertir toggle si falla
                document.getElementById('push-toggle').checked = false;
                
                if (result.reason === 'permission_denied') {
                    alert('Necesitas permitir las notificaciones en tu navegador');
                }
            }
        } else {
            await this.client.unsubscribe();
        }

        this.render();
    }
}

window.PushNotificationButton = PushNotificationButton;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PushNotificationClient, PushNotificationButton };
}
