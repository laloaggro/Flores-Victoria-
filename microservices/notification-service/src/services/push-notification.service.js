/**
 * Servicio de Notificaciones Push - Flores Victoria
 * Firebase Cloud Messaging para notificaciones en tiempo real
 */

// Nota: En producción, usar firebase-admin SDK con credenciales del servidor
// Este servicio se puede usar tanto con FCM como con Web Push API

class PushNotificationService {
    constructor() {
        // Configuración de Firebase (del environment)
        this.firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            serverKey: process.env.FIREBASE_SERVER_KEY
        };

        // Almacén de tokens de dispositivos (en producción usar Redis/DB)
        this.deviceTokens = new Map(); // userId -> Set<tokens>
        
        // Plantillas de notificación
        this.templates = this.initTemplates();
        
        // Estadísticas
        this.stats = {
            sent: 0,
            failed: 0,
            byType: {}
        };

        console.log('🔔 Push Notification Service inicializado');
    }

    // ========================================================================
    // PLANTILLAS DE NOTIFICACIÓN
    // ========================================================================

    initTemplates() {
        return {
            // Pedidos
            order_created: {
                title: '¡Pedido Confirmado! 🌸',
                body: 'Tu pedido #{orderId} ha sido confirmado. Total: ${total}',
                icon: '/icons/order-confirmed.png',
                badge: '/icons/badge.png',
                data: { type: 'order', action: 'view_order' }
            },
            order_processing: {
                title: 'Preparando tu pedido 💐',
                body: 'Estamos preparando tu pedido #{orderId} con mucho cariño',
                icon: '/icons/preparing.png',
                data: { type: 'order', action: 'track_order' }
            },
            order_shipped: {
                title: '¡En camino! 🚚',
                body: 'Tu pedido #{orderId} está en camino. Llegará aproximadamente a las {estimatedTime}',
                icon: '/icons/shipping.png',
                data: { type: 'order', action: 'track_delivery' }
            },
            order_delivered: {
                title: '¡Entregado! 🎉',
                body: 'Tu pedido #{orderId} ha sido entregado. ¡Esperamos que lo disfrutes!',
                icon: '/icons/delivered.png',
                data: { type: 'order', action: 'leave_review' }
            },

            // Promociones
            promotion_new: {
                title: '¡Nueva Promoción! 🌷',
                body: '{promotionTitle} - {discount}% de descuento. Válido hasta {validUntil}',
                icon: '/icons/promotion.png',
                data: { type: 'promotion', action: 'view_promotion' }
            },
            flash_sale: {
                title: '⚡ Venta Flash - Solo hoy',
                body: '{productName} con {discount}% de descuento. ¡No te lo pierdas!',
                icon: '/icons/flash-sale.png',
                data: { type: 'flash_sale', action: 'view_product' }
            },

            // Carrito abandonado
            cart_abandoned: {
                title: '¿Olvidaste algo? 🛒',
                body: 'Tienes {itemCount} artículos esperándote. ¡Completa tu compra!',
                icon: '/icons/cart.png',
                data: { type: 'cart', action: 'view_cart' }
            },
            cart_reminder: {
                title: 'Tu carrito te extraña 💕',
                body: '{productName} y otros artículos siguen disponibles',
                icon: '/icons/cart-heart.png',
                data: { type: 'cart', action: 'view_cart' }
            },

            // Suscripciones
            subscription_reminder: {
                title: 'Tu entrega se acerca 🌺',
                body: 'Tu próxima entrega de suscripción será el {deliveryDate}',
                icon: '/icons/subscription.png',
                data: { type: 'subscription', action: 'view_subscription' }
            },
            subscription_delivered: {
                title: '¡Flores entregadas! 💐',
                body: 'Tu entrega de suscripción ha llegado. ¡Disfrútalas!',
                icon: '/icons/flowers-delivered.png',
                data: { type: 'subscription', action: 'view_delivery' }
            },
            subscription_renewal: {
                title: 'Renovación de Suscripción 🔄',
                body: 'Tu suscripción se renovará el {renewalDate}. Total: ${amount}',
                icon: '/icons/renewal.png',
                data: { type: 'subscription', action: 'manage_subscription' }
            },

            // Fidelización
            points_earned: {
                title: '¡Ganaste puntos! ⭐',
                body: '+{points} puntos Victoria. Total acumulado: {totalPoints}',
                icon: '/icons/points.png',
                data: { type: 'loyalty', action: 'view_points' }
            },
            level_up: {
                title: '¡Subiste de nivel! 🏆',
                body: 'Felicidades, ahora eres {levelName}. Disfruta de nuevos beneficios',
                icon: '/icons/level-up.png',
                data: { type: 'loyalty', action: 'view_benefits' }
            },
            reward_available: {
                title: '¡Tienes una recompensa! 🎁',
                body: 'Puedes canjear {rewardName} con tus puntos',
                icon: '/icons/reward.png',
                data: { type: 'loyalty', action: 'redeem_reward' }
            },

            // Chat
            chat_message: {
                title: 'Nuevo mensaje 💬',
                body: '{agentName}: {messagePreview}',
                icon: '/icons/chat.png',
                data: { type: 'chat', action: 'open_chat' }
            },

            // General
            welcome: {
                title: '¡Bienvenido a Flores Victoria! 🌸',
                body: 'Gracias por unirte. Descubre nuestros hermosos arreglos florales',
                icon: '/icons/welcome.png',
                data: { type: 'welcome', action: 'explore' }
            },
            birthday: {
                title: '¡Feliz Cumpleaños! 🎂🌷',
                body: 'Flores Victoria te desea un maravilloso día. Tienes un regalo especial',
                icon: '/icons/birthday.png',
                data: { type: 'birthday', action: 'claim_gift' }
            }
        };
    }

    // ========================================================================
    // GESTIÓN DE TOKENS
    // ========================================================================

    /**
     * Registra un token de dispositivo para un usuario
     */
    async registerToken(userId, token, deviceInfo = {}) {
        if (!userId || !token) {
            throw new Error('userId y token son requeridos');
        }

        // Obtener tokens existentes
        let userTokens = this.deviceTokens.get(userId);
        if (!userTokens) {
            userTokens = new Map();
            this.deviceTokens.set(userId, userTokens);
        }

        // Guardar token con información del dispositivo
        userTokens.set(token, {
            token,
            deviceInfo,
            registeredAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
        });

        console.log(`📱 Token registrado para usuario ${userId}`);

        return {
            success: true,
            userId,
            tokenCount: userTokens.size
        };
    }

    /**
     * Elimina un token de dispositivo
     */
    async unregisterToken(userId, token) {
        const userTokens = this.deviceTokens.get(userId);
        if (userTokens) {
            userTokens.delete(token);
            
            // Limpiar si no hay más tokens
            if (userTokens.size === 0) {
                this.deviceTokens.delete(userId);
            }
        }

        return { success: true };
    }

    /**
     * Obtiene todos los tokens de un usuario
     */
    getTokensForUser(userId) {
        const userTokens = this.deviceTokens.get(userId);
        if (!userTokens) return [];
        return Array.from(userTokens.values()).map(t => t.token);
    }

    // ========================================================================
    // ENVÍO DE NOTIFICACIONES
    // ========================================================================

    /**
     * Envía una notificación push a un usuario
     */
    async sendToUser(userId, templateKey, data = {}) {
        const tokens = this.getTokensForUser(userId);
        
        if (tokens.length === 0) {
            console.log(`⚠️ No hay tokens para el usuario ${userId}`);
            return { success: false, reason: 'no_tokens' };
        }

        const notification = this.buildNotification(templateKey, data);
        
        const results = await Promise.all(
            tokens.map(token => this.sendToDevice(token, notification, data))
        );

        // Limpiar tokens inválidos
        results.forEach((result, index) => {
            if (result.error === 'invalid_token') {
                this.unregisterToken(userId, tokens[index]);
            }
        });

        const successCount = results.filter(r => r.success).length;
        
        // Actualizar estadísticas
        this.updateStats(templateKey, successCount, results.length - successCount);

        return {
            success: successCount > 0,
            sent: successCount,
            failed: results.length - successCount,
            results
        };
    }

    /**
     * Envía una notificación a múltiples usuarios
     */
    async sendToUsers(userIds, templateKey, data = {}) {
        const results = await Promise.all(
            userIds.map(userId => this.sendToUser(userId, templateKey, data))
        );

        return {
            success: true,
            totalUsers: userIds.length,
            successUsers: results.filter(r => r.success).length,
            results
        };
    }

    /**
     * Envía una notificación a todos los usuarios (broadcast)
     */
    async broadcast(templateKey, data = {}, filters = {}) {
        const allUserIds = Array.from(this.deviceTokens.keys());
        
        // Aplicar filtros si existen
        let targetUsers = allUserIds;
        if (filters.excludeUsers) {
            targetUsers = allUserIds.filter(id => !filters.excludeUsers.includes(id));
        }

        return this.sendToUsers(targetUsers, templateKey, data);
    }

    /**
     * Envía una notificación a un dispositivo específico
     */
    async sendToDevice(token, notification, data = {}) {
        try {
            // Usando FCM HTTP v1 API
            const message = {
                to: token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: notification.icon || '/icons/default.png',
                    badge: notification.badge,
                    click_action: notification.clickAction || '/'
                },
                data: {
                    ...notification.data,
                    ...data,
                    timestamp: new Date().toISOString()
                },
                // Configuración para Android
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        click_action: notification.clickAction,
                        color: '#d63384'
                    }
                },
                // Configuración para iOS
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                },
                // Configuración para Web
                webpush: {
                    headers: {
                        TTL: '86400' // 24 horas
                    },
                    notification: {
                        icon: notification.icon,
                        badge: notification.badge,
                        vibrate: [200, 100, 200],
                        requireInteraction: notification.requireInteraction || false
                    }
                }
            };

            // En producción, enviar a FCM
            if (this.firebaseConfig.serverKey) {
                const response = await this.sendToFCM(message);
                return { success: true, messageId: response.messageId };
            }

            // Modo desarrollo - simular envío
            console.log('📤 [DEV] Push notification:', {
                token: token.substring(0, 20) + '...',
                title: notification.title,
                body: notification.body
            });

            return { success: true, messageId: `dev-${Date.now()}` };

        } catch (error) {
            console.error('❌ Error enviando push:', error.message);
            
            // Detectar token inválido
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                return { success: false, error: 'invalid_token' };
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Envía mensaje a Firebase Cloud Messaging
     */
    async sendToFCM(message) {
        const fetch = require('node-fetch');
        
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${this.firebaseConfig.serverKey}`
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`FCM error: ${response.status}`);
        }

        return response.json();
    }

    // ========================================================================
    // CONSTRUCCIÓN DE NOTIFICACIONES
    // ========================================================================

    /**
     * Construye una notificación desde una plantilla
     */
    buildNotification(templateKey, data = {}) {
        const template = this.templates[templateKey];
        
        if (!template) {
            throw new Error(`Plantilla "${templateKey}" no encontrada`);
        }

        // Reemplazar placeholders en título y cuerpo
        let title = template.title;
        let body = template.body;

        Object.entries(data).forEach(([key, value]) => {
            const placeholder = new RegExp(`{${key}}|#{${key}}|\\$\\{${key}\\}`, 'g');
            title = title.replace(placeholder, value);
            body = body.replace(placeholder, value);
        });

        return {
            title,
            body,
            icon: template.icon,
            badge: template.badge,
            data: { ...template.data, ...data },
            clickAction: data.clickAction
        };
    }

    /**
     * Crea una notificación personalizada
     */
    createCustomNotification(title, body, options = {}) {
        return {
            title,
            body,
            icon: options.icon || '/icons/default.png',
            badge: options.badge,
            data: options.data || {},
            clickAction: options.clickAction,
            requireInteraction: options.requireInteraction || false
        };
    }

    // ========================================================================
    // NOTIFICACIONES ESPECÍFICAS
    // ========================================================================

    /**
     * Notifica sobre un nuevo pedido
     */
    async notifyOrderStatus(userId, orderId, status, details = {}) {
        const templateMap = {
            pending: 'order_created',
            confirmed: 'order_created',
            preparing: 'order_processing',
            shipped: 'order_shipped',
            delivered: 'order_delivered'
        };

        const templateKey = templateMap[status];
        if (!templateKey) return { success: false, reason: 'unknown_status' };

        return this.sendToUser(userId, templateKey, {
            orderId,
            ...details
        });
    }

    /**
     * Notifica sobre carrito abandonado
     */
    async notifyAbandonedCart(userId, cartDetails) {
        return this.sendToUser(userId, 'cart_abandoned', {
            itemCount: cartDetails.itemCount,
            productName: cartDetails.firstProduct?.name,
            total: cartDetails.total
        });
    }

    /**
     * Notifica sobre puntos ganados
     */
    async notifyPointsEarned(userId, points, totalPoints) {
        return this.sendToUser(userId, 'points_earned', {
            points,
            totalPoints
        });
    }

    /**
     * Notifica sobre promoción
     */
    async notifyPromotion(userIds, promotion) {
        return this.sendToUsers(userIds, 'promotion_new', {
            promotionTitle: promotion.title,
            discount: promotion.discount,
            validUntil: promotion.validUntil,
            clickAction: `/promotions/${promotion.id}`
        });
    }

    /**
     * Notifica sobre entrega de suscripción
     */
    async notifySubscriptionDelivery(userId, subscriptionId, deliveryDate) {
        return this.sendToUser(userId, 'subscription_reminder', {
            deliveryDate,
            subscriptionId,
            clickAction: `/account/subscriptions/${subscriptionId}`
        });
    }

    /**
     * Notifica mensaje de chat
     */
    async notifyChatMessage(userId, agentName, message) {
        return this.sendToUser(userId, 'chat_message', {
            agentName,
            messagePreview: message.length > 50 ? message.substring(0, 47) + '...' : message,
            clickAction: '/chat'
        });
    }

    // ========================================================================
    // ESTADÍSTICAS
    // ========================================================================

    updateStats(templateKey, sent, failed) {
        this.stats.sent += sent;
        this.stats.failed += failed;
        
        if (!this.stats.byType[templateKey]) {
            this.stats.byType[templateKey] = { sent: 0, failed: 0 };
        }
        this.stats.byType[templateKey].sent += sent;
        this.stats.byType[templateKey].failed += failed;
    }

    getStats() {
        return {
            ...this.stats,
            registeredDevices: Array.from(this.deviceTokens.values())
                .reduce((sum, tokens) => sum + tokens.size, 0),
            registeredUsers: this.deviceTokens.size
        };
    }

    resetStats() {
        this.stats = { sent: 0, failed: 0, byType: {} };
    }
}

// Singleton
const pushService = new PushNotificationService();

module.exports = {
    PushNotificationService,
    pushService
};
