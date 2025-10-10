const request = require('supertest');
const express = require('express');
const CartController = require('../../controllers/cartController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock del cliente de Redis para pruebas de integración
let mockRedis;

// Inicializar el controlador con Redis mock
let cartController;

// Middleware para inyectar Redis mock
app.use((req, res, next) => {
  req.redis = mockRedis;
  next();
});

// Inicializar controladores con Redis mock
app.use((req, res, next) => {
  cartController = new CartController(req.redis);
  next();
});

// Rutas para pruebas
app.get('/api/cart', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  cartController.getCart(req, res);
});

app.post('/api/cart/items', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  cartController.addItem(req, res);
});

app.put('/api/cart/items/:productId', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  cartController.updateItem(req, res);
});

app.delete('/api/cart/items/:productId', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  cartController.removeItem(req, res);
});

app.delete('/api/cart', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  cartController.clearCart(req, res);
});

describe('Cart Service Integration Tests', () => {
  beforeEach(() => {
    // Crear un cliente Redis mock para cada prueba
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cart', () => {
    it('debería obtener el carrito del usuario', async () => {
      const mockCart = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2, price: 10.00 },
          { productId: 2, quantity: 1, price: 15.00 }
        ],
        total: 35.00
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockCart));

      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          cart: mockCart
        }
      });
    });

    it('debería devolver un carrito vacío si no existe', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          cart: {
            userId: 1,
            items: [],
            total: 0
          }
        }
      });
    });

    it('debería manejar errores al obtener el carrito', async () => {
      mockRedis.get.mockRejectedValueOnce(new Error('Error de Redis'));

      const response = await request(app)
        .get('/api/cart')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('POST /api/cart/items', () => {
    it('debería agregar un item al carrito', async () => {
      const newItem = {
        productId: 1,
        quantity: 2,
        price: 10.00
      };
      
      const existingCart = {
        userId: 1,
        items: [],
        total: 0
      };
      
      const updatedCart = {
        userId: 1,
        items: [newItem],
        total: 20.00
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingCart));
      mockRedis.setex.mockResolvedValueOnce('OK');

      const response = await request(app)
        .post('/api/cart/items')
        .send(newItem)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Producto agregado al carrito',
        data: {
          cart: updatedCart
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteItem = {
        productId: 1
      };

      const response = await request(app)
        .post('/api/cart/items')
        .send(incompleteItem)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto, cantidad y precio son requeridos'
      });
    });
  });

  describe('PUT /api/cart/items/:productId', () => {
    it('debería actualizar un item en el carrito', async () => {
      const existingCart = {
        userId: 1,
        items: [{ productId: 1, quantity: 2, price: 10.00 }],
        total: 20.00
      };
      
      const updatedCart = {
        userId: 1,
        items: [{ productId: 1, quantity: 5, price: 10.00 }],
        total: 50.00
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingCart));
      mockRedis.setex.mockResolvedValueOnce('OK');

      const response = await request(app)
        .put('/api/cart/items/1')
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Carrito actualizado',
        data: {
          cart: updatedCart
        }
      });
    });

    it('debería devolver 404 si el producto no está en el carrito', async () => {
      const existingCart = {
        userId: 1,
        items: [{ productId: 2, quantity: 1, price: 15.00 }],
        total: 15.00
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingCart));

      const response = await request(app)
        .put('/api/cart/items/1')
        .send({ quantity: 5 })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto no encontrado en el carrito'
      });
    });
  });

  describe('DELETE /api/cart/items/:productId', () => {
    it('debería eliminar un item del carrito', async () => {
      const existingCart = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2, price: 10.00 },
          { productId: 2, quantity: 1, price: 15.00 }
        ],
        total: 35.00
      };
      
      const updatedCart = {
        userId: 1,
        items: [
          { productId: 2, quantity: 1, price: 15.00 }
        ],
        total: 15.00
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingCart));
      mockRedis.setex.mockResolvedValueOnce('OK');

      const response = await request(app)
        .delete('/api/cart/items/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Producto eliminado del carrito',
        data: {
          cart: updatedCart
        }
      });
    });

    it('debería devolver 404 si el producto no está en el carrito', async () => {
      const existingCart = {
        userId: 1,
        items: [{ productId: 2, quantity: 1, price: 15.00 }],
        total: 15.00
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingCart));

      const response = await request(app)
        .delete('/api/cart/items/1')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto no encontrado en el carrito'
      });
    });
  });

  describe('DELETE /api/cart', () => {
    it('debería limpiar el carrito', async () => {
      mockRedis.del.mockResolvedValueOnce(1);

      const response = await request(app)
        .delete('/api/cart')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Carrito vaciado'
      });
    });

    it('debería manejar errores al limpiar el carrito', async () => {
      mockRedis.del.mockRejectedValueOnce(new Error('Error de Redis'));

      const response = await request(app)
        .delete('/api/cart')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });
});