// Ejemplo de cómo usar la mensajería en microservicios
const winston = require('winston');

const messageBroker = require('../index');

// Productor - Enviar mensaje cuando se crea una orden
async function sendOrderCreatedMessage(orderData) {
  try {
    await messageBroker.sendMessage('order.created', {
      orderId: orderData.id,
      userId: orderData.userId,
      products: orderData.products,
      total: orderData.total,
      timestamp: new Date().toISOString(),
    });

    winston.info(`Mensaje de orden creada enviado para orden ${orderData.id}`);
  } catch (error) {
    winston.error('Error al enviar mensaje de orden creada:', error);
  }
}

// Consumidor - Procesar mensajes de órdenes creadas
async function processOrderCreatedMessages() {
  try {
    await messageBroker.consumeMessages('order.created', async (message) => {
      winston.info('Procesando mensaje de orden creada:', message);

      // Aquí iría la lógica para:
      // 1. Enviar notificación por email al usuario
      // 2. Actualizar el inventario
      // 3. Registrar la orden en sistemas externos
      // 4. etc.

      // Ejemplo de envío de notificación por email
      await sendOrderNotification(message);

      // Ejemplo de actualización de inventario
      await updateInventory(message.products);
    });
  } catch (error) {
    winston.error('Error al procesar mensajes de órdenes creadas:', error);
  }
}

// Función de ejemplo para enviar notificación
async function sendOrderNotification(orderData) {
  winston.info(
    `Enviando notificación para orden ${orderData.orderId} al usuario ${orderData.userId}`
  );
  // Implementación real del envío de email
}

// Función de ejemplo para actualizar inventario
async function updateInventory(products) {
  winston.info('Actualizando inventario para productos:', products);
  // Implementación real de actualización de inventario
}

module.exports = {
  sendOrderCreatedMessage,
  processOrderCreatedMessages,
};
