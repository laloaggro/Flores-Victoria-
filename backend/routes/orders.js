const express = require('express');
const router = express.Router();

// En un entorno real, estos datos se almacenarían en una base de datos
let orders = [
  {
    id: 1,
    userId: 4,
    customerName: 'Mauricio Garay Veas (laloaggro)',
    customerEmail: 'laloaggro@gmail.com',
    items: [
      { productId: 441, productName: 'Hermoso Centro 1', quantity: 2, price: 7171 }
    ],
    total: 14342,
    status: 'Completado',
    date: '2025-08-20T14:30:00Z',
    shippingAddress: 'Av. Valdivieso 593, Recoleta',
    paymentMethod: 'Tarjeta de crédito'
  },
  {
    id: 2,
    userId: 4,
    customerName: 'Mauricio Garay Veas (laloaggro)',
    customerEmail: 'laloaggro@gmail.com',
    items: [
      { productId: 442, productName: 'Exótico Centro 2', quantity: 1, price: 16449 },
      { productId: 445, productName: 'Sublime Jardín 5', quantity: 1, price: 20238 }
    ],
    total: 36687,
    status: 'Pendiente',
    date: '2025-08-22T10:15:00Z',
    shippingAddress: 'Av. Valdivieso 593, Recoleta',
    paymentMethod: 'Tarjeta de crédito'
  }
];

// Crear un nuevo pedido
router.post('/create', (req, res) => {
  const { userId, customerName, customerEmail, items, total, shippingAddress, paymentMethod } = req.body;
  
  // Validar datos requeridos
  if (!userId || !customerName || !customerEmail || !items || !total || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: 'Faltan datos requeridos para crear el pedido' });
  }
  
  // Crear nuevo pedido
  const newOrder = {
    id: orders.length + 1,
    userId,
    customerName,
    customerEmail,
    items,
    total,
    status: 'Pendiente',
    date: new Date().toISOString(),
    shippingAddress,
    paymentMethod
  };
  
  orders.push(newOrder);
  console.log('Nuevo pedido creado:', newOrder);
  res.status(201).json(newOrder);
});

// Obtener todos los pedidos
router.get('/', (req, res) => {
  res.json(orders);
});

// Obtener pedidos de un usuario específico
router.get('/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userOrders = orders.filter(order => order.userId === userId);
  res.json(userOrders);
});

// Obtener un pedido específico por ID
router.get('/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(order => order.id === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  
  res.json(order);
});

// Actualizar estado de un pedido
router.put('/:id/status', (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  
  const order = orders.find(order => order.id === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  
  // Actualizar estado
  order.status = status;
  res.json({ message: 'Estado del pedido actualizado', order });
});

module.exports = router;