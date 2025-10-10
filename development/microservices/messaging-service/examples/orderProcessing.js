const { sendMessage, consumeMessages, publishMessage, subscribeToExchange } = require('../src/app');

// Ejemplo de procesamiento de pedidos usando mensajería

// Función para enviar una notificación de nuevo pedido
async function sendNewOrderNotification(order) {
  const message = {
    type: 'NEW_ORDER',
    orderId: order.id,
    customerId: order.customerId,
    items: order.items,
    total: order.total,
    timestamp: new Date()
  };
  
  // Enviar mensaje a la cola de notificaciones
  await sendMessage('notifications', message);
  
  // Publicar mensaje en el exchange de pedidos
  await publishMessage('orders', 'order.created', message);
}

// Función para procesar pagos
async function processPayment(order) {
  const message = {
    type: 'PROCESS_PAYMENT',
    orderId: order.id,
    amount: order.total,
    paymentMethod: order.paymentMethod,
    timestamp: new Date()
  };
  
  // Enviar mensaje a la cola de pagos
  await sendMessage('payments', message);
}

// Función para actualizar el inventario
async function updateInventory(order) {
  for (const item of order.items) {
    const message = {
      type: 'UPDATE_INVENTORY',
      productId: item.productId,
      quantity: item.quantity,
      orderId: order.id,
      timestamp: new Date()
    };
    
    // Enviar mensaje a la cola de inventario
    await sendMessage('inventory', message);
  }
}

// Consumir mensajes de notificaciones
async function consumeNotifications() {
  await consumeMessages('notifications', async (message) => {
    switch (message.type) {
      case 'NEW_ORDER':
        console.log(`Notificación: Nuevo pedido #${message.orderId} recibido`);
        // Aquí iría la lógica para enviar notificaciones por email, SMS, etc.
        break;
      case 'ORDER_SHIPPED':
        console.log(`Notificación: Pedido #${message.orderId} ha sido enviado`);
        // Aquí iría la lógica para notificar al cliente
        break;
      default:
        console.log(`Tipo de notificación desconocido: ${message.type}`);
    }
  });
}

// Suscribirse a eventos de pedidos
async function subscribeToOrderEvents() {
  await subscribeToExchange('orders', 'order.*', 'order-notifications', async (message) => {
    console.log(`Evento de pedido recibido: ${message.type}`);
    // Procesar eventos de pedidos
  });
}

// Ejemplo de uso
async function example() {
  // Simular un nuevo pedido
  const order = {
    id: 'ORD-001',
    customerId: 'CUST-001',
    items: [
      { productId: 'PROD-001', quantity: 2, price: 25.99 },
      { productId: 'PROD-002', quantity: 1, price: 35.50 }
    ],
    total: 87.48,
    paymentMethod: 'credit_card'
  };
  
  // Enviar notificación de nuevo pedido
  await sendNewOrderNotification(order);
  
  // Procesar pago
  await processPayment(order);
  
  // Actualizar inventario
  await updateInventory(order);
}

// Exportar funciones
module.exports = {
  sendNewOrderNotification,
  processPayment,
  updateInventory,
  consumeNotifications,
  subscribeToOrderEvents,
  example
};