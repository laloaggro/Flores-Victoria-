const request = require('supertest');
const express = require('express');
const OrderController = require('../../controllers/orderController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock del cliente de base de datos para pruebas de integración
let mockDb;

// Inicializar el controlador con una base de datos mock
let orderController;

// Middleware para inyectar la base de datos mock
app.use((req, res, next) => {
  req.db = mockDb;
  next();
});

// Inicializar controladores con base de datos mock
app.use((req, res, next) => {
  orderController = new OrderController(req.db);
  next();
});

// Rutas para pruebas
app.get('/api/orders', (req, res) => {
  orderController.getAllOrders(req, res);
});

app.get('/api/orders/:id', (req, res) => {
  orderController.getOrderById(req, res);
});

app.post('/api/orders', (req, res) => {
  orderController.createOrder(req, res);
});

app.put('/api/orders/:id', (req, res) => {
  orderController.updateOrder(req, res);
});

describe('Order Service Integration Tests', () => {
  beforeEach(() => {
    // Crear una base de datos mock para cada prueba
    mockDb = {
      query: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('debería obtener una lista de pedidos', async () => {
      const mockOrders = [
        { 
          id: 1, 
          userId: 1, 
          products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
          total: 20.00,
          status: 'pending'
        },
        { 
          id: 2, 
          userId: 2, 
          products: [{ id: 2, name: 'Producto 2', quantity: 1, price: 15.00 }],
          total: 15.00,
          status: 'completed'
        }
      ];
      
      mockDb.query.mockResolvedValueOnce({ rows: mockOrders });

      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          orders: mockOrders
        }
      });
    });

    it('debería manejar errores al obtener pedidos', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/orders')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    it('debería obtener un pedido por ID', async () => {
      const mockOrder = { 
        id: 1, 
        userId: 1, 
        products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
        total: 20.00,
        status: 'pending'
      };
      mockDb.query.mockResolvedValueOnce({ rows: [mockOrder] });

      const response = await request(app)
        .get('/api/orders/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          order: mockOrder
        }
      });
    });

    it('debería devolver 404 si el pedido no existe', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/orders/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Pedido no encontrado'
      });
    });
  });

  describe('POST /api/orders', () => {
    it('debería crear un nuevo pedido', async () => {
      const newOrder = {
        userId: 1,
        products: [{ id: 1, quantity: 2 }],
        total: 20.00
      };
      
      const createdOrder = {
        id: 1,
        ...newOrder,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      mockDb.query.mockResolvedValueOnce({ rows: [createdOrder] });

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Pedido creado exitosamente',
        data: {
          order: createdOrder
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteOrder = {
        userId: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(incompleteOrder)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Usuario y productos son requeridos'
      });
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('debería actualizar un pedido existente', async () => {
      const existingOrder = { 
        id: 1, 
        userId: 1, 
        products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
        total: 20.00,
        status: 'pending'
      };
      
      const updatedOrder = { 
        id: 1, 
        userId: 1, 
        products: [{ id: 1, name: 'Producto 1', quantity: 2, price: 10.00 }],
        total: 20.00,
        status: 'completed'
      };
      
      // Mock para verificar que el pedido existe
      mockDb.query
        .mockResolvedValueOnce({ rows: [existingOrder] }) // Para verificar existencia
        .mockResolvedValueOnce({ rowCount: 1 }); // Para actualizar

      const response = await request(app)
        .put('/api/orders/1')
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Pedido actualizado exitosamente',
        data: {
          order: updatedOrder
        }
      });
    });

    it('debería devolver 404 al intentar actualizar un pedido que no existe', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/orders/999')
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Pedido no encontrado'
      });
    });
  });
});