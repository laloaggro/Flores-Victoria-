/**
 * @fileoverview WhatsApp Business API Service
 * Integración con la API de WhatsApp Business para notificaciones
 * 
 * Flores Victoria - Santiago Norte, Chile
 * 
 * Usa la API oficial de Meta/WhatsApp Business
 * Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const https = require('https');

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const WHATSAPP_CONFIG = {
  apiVersion: 'v18.0',
  baseUrl: 'graph.facebook.com',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
};

// Templates predefinidos para WhatsApp Business
const MESSAGE_TEMPLATES = {
  // Confirmación de pedido
  ORDER_CONFIRMATION: {
    name: 'order_confirmation',
    language: 'es_CL',
    components: [
      {
        type: 'header',
        parameters: [{ type: 'text', text: '{{orderNumber}}' }],
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{customerName}}' },
          { type: 'text', text: '{{orderTotal}}' },
          { type: 'text', text: '{{deliveryDate}}' },
        ],
      },
    ],
  },

  // Pedido en preparación
  ORDER_PREPARING: {
    name: 'order_preparing',
    language: 'es_CL',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{orderNumber}}' },
          { type: 'text', text: '{{estimatedTime}}' },
        ],
      },
    ],
  },

  // Pedido en camino
  ORDER_SHIPPED: {
    name: 'order_shipped',
    language: 'es_CL',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{orderNumber}}' },
          { type: 'text', text: '{{deliveryAddress}}' },
          { type: 'text', text: '{{estimatedArrival}}' },
        ],
      },
    ],
  },

  // Pedido entregado
  ORDER_DELIVERED: {
    name: 'order_delivered',
    language: 'es_CL',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{orderNumber}}' },
          { type: 'text', text: '{{deliveryTime}}' },
        ],
      },
    ],
  },

  // Recordatorio de pago
  PAYMENT_REMINDER: {
    name: 'payment_reminder',
    language: 'es_CL',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{orderNumber}}' },
          { type: 'text', text: '{{amount}}' },
          { type: 'text', text: '{{paymentLink}}' },
        ],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

class WhatsAppService {
  constructor(options = {}) {
    this.phoneNumberId = options.phoneNumberId || WHATSAPP_CONFIG.phoneNumberId;
    this.accessToken = options.accessToken || WHATSAPP_CONFIG.accessToken;
    this.businessAccountId = options.businessAccountId || WHATSAPP_CONFIG.businessAccountId;
    this.apiVersion = options.apiVersion || WHATSAPP_CONFIG.apiVersion;
    this.baseUrl = WHATSAPP_CONFIG.baseUrl;
    this.logger = options.logger || console;
    this.enabled = !!(this.phoneNumberId && this.accessToken);
    
    if (!this.enabled) {
      this.logger.warn('[WhatsApp] Servicio no configurado (faltan credenciales)');
    }
  }

  /**
   * Verifica si el servicio está habilitado
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Normaliza número de teléfono chileno
   * @param {string} phone - Número de teléfono
   * @returns {string} Número normalizado con código de país
   */
  normalizeChileanPhone(phone) {
    // Eliminar caracteres no numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Si empieza con 56, ya tiene código de país
    if (cleaned.startsWith('56')) {
      return cleaned;
    }
    
    // Si empieza con 9 y tiene 9 dígitos, es móvil chileno
    if (cleaned.startsWith('9') && cleaned.length === 9) {
      return `56${cleaned}`;
    }
    
    // Si tiene 8 dígitos, agregar 9 al inicio (móvil)
    if (cleaned.length === 8) {
      return `569${cleaned}`;
    }
    
    // Agregar código de país por defecto
    return `56${cleaned}`;
  }

  /**
   * Realiza una petición HTTP a la API de WhatsApp
   * @private
   */
  async _makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/${this.apiVersion}/${endpoint}`,
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(response.error?.message || `HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${body}`));
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Envía un mensaje de texto simple
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} message - Mensaje de texto
   * @returns {Promise<Object>}
   */
  async sendTextMessage(to, message) {
    if (!this.enabled) {
      this.logger.warn('[WhatsApp] Servicio no habilitado, mensaje no enviado');
      return { success: false, error: 'Service not enabled' };
    }

    const normalizedPhone = this.normalizeChileanPhone(to);
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    try {
      const response = await this._makeRequest(
        'POST',
        `${this.phoneNumberId}/messages`,
        payload
      );

      this.logger.info(`[WhatsApp] Mensaje enviado a ${normalizedPhone}`, {
        messageId: response.messages?.[0]?.id,
      });

      return {
        success: true,
        messageId: response.messages?.[0]?.id,
        to: normalizedPhone,
      };
    } catch (error) {
      this.logger.error('[WhatsApp] Error enviando mensaje:', error.message);
      return {
        success: false,
        error: error.message,
        to: normalizedPhone,
      };
    }
  }

  /**
   * Envía un mensaje usando un template
   * @param {string} to - Número de teléfono
   * @param {string} templateName - Nombre del template
   * @param {Object} parameters - Parámetros del template
   * @returns {Promise<Object>}
   */
  async sendTemplateMessage(to, templateName, parameters = {}) {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const template = MESSAGE_TEMPLATES[templateName];
    if (!template) {
      return { success: false, error: `Template '${templateName}' not found` };
    }

    const normalizedPhone = this.normalizeChileanPhone(to);

    // Reemplazar parámetros en los componentes
    const components = template.components.map(comp => {
      const newComp = { type: comp.type };
      if (comp.parameters) {
        newComp.parameters = comp.parameters.map(param => {
          if (param.type === 'text') {
            const key = param.text.replace(/[{}]/g, '');
            return {
              type: 'text',
              text: parameters[key] || param.text,
            };
          }
          return param;
        });
      }
      return newComp;
    });

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizedPhone,
      type: 'template',
      template: {
        name: template.name,
        language: {
          code: template.language,
        },
        components,
      },
    };

    try {
      const response = await this._makeRequest(
        'POST',
        `${this.phoneNumberId}/messages`,
        payload
      );

      this.logger.info(`[WhatsApp] Template '${templateName}' enviado a ${normalizedPhone}`);

      return {
        success: true,
        messageId: response.messages?.[0]?.id,
        to: normalizedPhone,
        template: templateName,
      };
    } catch (error) {
      this.logger.error('[WhatsApp] Error enviando template:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE CONVENIENCIA PARA PEDIDOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Notifica confirmación de pedido
   */
  async notifyOrderConfirmed(phone, orderData) {
    const message = `🌸 *¡Pedido Confirmado!*

Hola ${orderData.customerName}! 👋

Tu pedido *#${orderData.orderNumber}* ha sido confirmado.

📦 *Detalle:*
${orderData.items?.map(i => `• ${i.name} x${i.quantity}`).join('\n') || 'Ver detalle en tu email'}

💰 *Total:* $${orderData.total?.toLocaleString('es-CL')} CLP

🚚 *Entrega:* ${orderData.deliveryDate}
📍 *Dirección:* ${orderData.deliveryAddress}

Te avisaremos cuando tu pedido esté en camino 🚗

_Flores Victoria - Con amor para ti_ 💐`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Notifica que el pedido está en preparación
   */
  async notifyOrderPreparing(phone, orderData) {
    const message = `🌷 *Pedido en Preparación*

Tu pedido *#${orderData.orderNumber}* está siendo preparado con mucho cariño 💝

⏱ *Tiempo estimado:* ${orderData.estimatedTime || '45-60 minutos'}

Te avisaremos cuando salga a reparto 🚚

_Flores Victoria_ 🌸`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Notifica que el pedido está en camino
   */
  async notifyOrderShipped(phone, orderData) {
    const message = `🚗 *¡Tu Pedido va en Camino!*

Tu pedido *#${orderData.orderNumber}* ya salió a reparto 📦

📍 *Destino:* ${orderData.deliveryAddress}
⏱ *Llegada estimada:* ${orderData.estimatedArrival || '30-45 minutos'}

${orderData.driverName ? `👤 Repartidor: ${orderData.driverName}` : ''}
${orderData.driverPhone ? `📱 Contacto: ${orderData.driverPhone}` : ''}

_Flores Victoria - En camino con amor_ 💐`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Notifica que el pedido fue entregado
   */
  async notifyOrderDelivered(phone, orderData) {
    const message = `✅ *¡Pedido Entregado!*

Tu pedido *#${orderData.orderNumber}* fue entregado exitosamente 🎉

📍 ${orderData.deliveryAddress}
🕐 ${orderData.deliveryTime || new Date().toLocaleTimeString('es-CL')}

¡Gracias por confiar en nosotros! 💝

⭐ ¿Te gustó nuestro servicio? 
Déjanos tu opinión: ${orderData.reviewLink || 'floresvictoria.cl/review'}

_Flores Victoria - Gracias por tu preferencia_ 🌸`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Notifica recordatorio de pago pendiente
   */
  async notifyPaymentReminder(phone, orderData) {
    const message = `💳 *Recordatorio de Pago*

Hola! Tu pedido *#${orderData.orderNumber}* está pendiente de pago.

💰 *Monto:* $${orderData.amount?.toLocaleString('es-CL')} CLP

🔗 *Pagar ahora:* ${orderData.paymentLink}

⚠️ El pedido se procesará una vez confirmado el pago.

¿Necesitas ayuda? Escríbenos! 📱

_Flores Victoria_ 🌸`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Envía mensaje promocional
   */
  async sendPromoMessage(phone, promoData) {
    const message = `🎉 *${promoData.title || 'Oferta Especial'}*

${promoData.description}

${promoData.discount ? `🏷 *Descuento:* ${promoData.discount}` : ''}
${promoData.code ? `📝 *Código:* ${promoData.code}` : ''}
${promoData.validUntil ? `⏰ *Válido hasta:* ${promoData.validUntil}` : ''}

🛒 Compra en: floresvictoria.cl

_Flores Victoria - Con amor para ti_ 💐`;

    return this.sendTextMessage(phone, message);
  }

  /**
   * Mensaje de bienvenida para nuevos clientes
   */
  async sendWelcomeMessage(phone, customerName) {
    const message = `🌸 *¡Bienvenido/a a Flores Victoria!*

Hola ${customerName}! 👋

Gracias por registrarte. Ahora podrás:

✨ Recibir ofertas exclusivas
🌷 Novedades en arreglos florales
🚚 Seguimiento de tus pedidos

📍 *Cobertura:* Santiago Norte
🕐 *Horario:* Lun-Sáb 9:00-21:00

¿Tienes alguna pregunta? ¡Escríbenos! 💬

_Flores Victoria - Con amor para ti_ 💐`;

    return this.sendTextMessage(phone, message);
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY Y EXPORTS
// ═══════════════════════════════════════════════════════════════

let instance = null;

/**
 * Obtiene instancia singleton del servicio
 */
function getWhatsAppService(options = {}) {
  if (!instance) {
    instance = new WhatsAppService(options);
  }
  return instance;
}

/**
 * Crea nueva instancia del servicio
 */
function createWhatsAppService(options = {}) {
  return new WhatsAppService(options);
}

module.exports = {
  WhatsAppService,
  getWhatsAppService,
  createWhatsAppService,
  MESSAGE_TEMPLATES,
  WHATSAPP_CONFIG,
};
