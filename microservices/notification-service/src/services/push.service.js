/**
 * Push Notification Service
 * Handles push notifications via Firebase Cloud Messaging (FCM)
 */

const logger = require('../utils/logger') || console;

class PushNotificationService {
  admin = null;
  initialized = false;

  async initialize() {
    if (this.initialized) return true;

    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (!serviceAccount) {
        logger.warn('Firebase service account not configured');
        return false;
      }

      const admin = require('firebase-admin');
      
      // Parse service account JSON from environment variable
      const credentials = JSON.parse(serviceAccount);
      
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });

      this.admin = admin;
      this.initialized = true;
      logger.info('✅ Push notification service initialized (FCM)');
      return true;
    } catch (error) {
      logger.error('Failed to initialize push notification service:', error.message);
      return false;
    }
  }

  async sendPushNotification({ token, title, body, data = {}, imageUrl }) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.admin) {
      throw new Error('Push notification service not configured');
    }

    const message = {
      token,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'flores-victoria-notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
        },
        fcmOptions: {
          link: data.link || 'https://flores-victoria.cl',
        },
      },
    };

    const result = await this.admin.messaging().send(message);
    logger.info(`Push notification sent: ${result}`);
    return result;
  }

  async sendToTopic({ topic, title, body, data = {} }) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.admin) {
      throw new Error('Push notification service not configured');
    }

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    };

    const result = await this.admin.messaging().send(message);
    logger.info(`Push notification sent to topic ${topic}: ${result}`);
    return result;
  }

  async subscribeToTopic(tokens, topic) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.admin) {
      throw new Error('Push notification service not configured');
    }

    const response = await this.admin.messaging().subscribeToTopic(tokens, topic);
    logger.info(`Subscribed ${response.successCount} tokens to ${topic}`);
    return response;
  }

  async unsubscribeFromTopic(tokens, topic) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.admin) {
      throw new Error('Push notification service not configured');
    }

    const response = await this.admin.messaging().unsubscribeFromTopic(tokens, topic);
    logger.info(`Unsubscribed ${response.successCount} tokens from ${topic}`);
    return response;
  }

  // Template methods
  async sendOrderConfirmation(token, orderNumber, total) {
    return this.sendPushNotification({
      token,
      title: '¡Pedido Confirmado! 🎉',
      body: `Tu pedido #${orderNumber} por $${total.toLocaleString('es-CL')} ha sido confirmado.`,
      data: {
        type: 'order_confirmed',
        orderNumber,
        link: `/orders/${orderNumber}`,
      },
    });
  }

  async sendShippingUpdate(token, orderNumber, status) {
    const statusMessages = {
      processing: 'Estamos preparando tu pedido 📦',
      shipped: 'Tu pedido está en camino 🚚',
      out_for_delivery: 'Tu pedido será entregado hoy 🏠',
      delivered: '¡Tu pedido ha sido entregado! 🎁',
    };

    return this.sendPushNotification({
      token,
      title: 'Actualización de Envío',
      body: statusMessages[status] || `Estado: ${status}`,
      data: {
        type: 'shipping_update',
        orderNumber,
        status,
        link: `/orders/${orderNumber}/tracking`,
      },
    });
  }

  async sendPromotionNotification(token, promoTitle, discount) {
    return this.sendPushNotification({
      token,
      title: '🌸 ¡Oferta Especial!',
      body: `${promoTitle}: ${discount}% de descuento. ¡No te lo pierdas!`,
      data: {
        type: 'promotion',
        link: '/promotions',
      },
    });
  }

  async sendNewProductNotification(topic = 'new_products') {
    return this.sendToTopic({
      topic,
      title: '🌷 Nuevos Productos',
      body: '¡Mira nuestras últimas novedades en arreglos florales!',
      data: {
        type: 'new_products',
        link: '/products/new',
      },
    });
  }

  async sendCartReminderNotification(token, itemCount) {
    return this.sendPushNotification({
      token,
      title: '🛒 ¿Olvidaste algo?',
      body: `Tienes ${itemCount} producto(s) esperándote en tu carrito.`,
      data: {
        type: 'cart_reminder',
        link: '/cart',
      },
    });
  }

  async sendReviewRequest(token, orderNumber, productName) {
    return this.sendPushNotification({
      token,
      title: '⭐ ¿Qué te pareció?',
      body: `Cuéntanos tu experiencia con "${productName}". Tu opinión nos ayuda a mejorar.`,
      data: {
        type: 'review_request',
        orderNumber,
        link: `/orders/${orderNumber}/review`,
      },
    });
  }
}

module.exports = new PushNotificationService();
