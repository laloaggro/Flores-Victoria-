const request = require('supertest');
const express = require('express');
const WishlistController = require('../../controllers/wishlistController');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock del cliente de Redis para pruebas de integración
let mockRedis;

// Inicializar el controlador con Redis mock
let wishlistController;

// Middleware para inyectar Redis mock
app.use((req, res, next) => {
  req.redis = mockRedis;
  next();
});

// Inicializar controladores con Redis mock
app.use((req, res, next) => {
  wishlistController = new WishlistController(req.redis);
  next();
});

// Rutas para pruebas
app.get('/api/wishlist', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  wishlistController.getWishlist(req, res);
});

app.post('/api/wishlist/items', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  wishlistController.addItem(req, res);
});

app.delete('/api/wishlist/items/:productId', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  wishlistController.removeItem(req, res);
});

app.delete('/api/wishlist', (req, res) => {
  // Mock del usuario autenticado
  req.user = { id: 1 };
  wishlistController.clearWishlist(req, res);
});

describe('Wishlist Service Integration Tests', () => {
  beforeEach(() => {
    // Crear un cliente Redis mock para cada prueba
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      sadd: jest.fn(),
      srem: jest.fn(),
      smembers: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/wishlist', () => {
    it('debería obtener la lista de deseos del usuario', async () => {
      const mockWishlist = {
        userId: 1,
        items: [
          { productId: 1, name: 'Producto 1', price: 10.00 },
          { productId: 2, name: 'Producto 2', price: 15.00 }
        ]
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockWishlist));

      const response = await request(app)
        .get('/api/wishlist')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          wishlist: mockWishlist
        }
      });
    });

    it('debería devolver una lista de deseos vacía si no existe', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/wishlist')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          wishlist: {
            userId: 1,
            items: []
          }
        }
      });
    });

    it('debería manejar errores al obtener la lista de deseos', async () => {
      mockRedis.get.mockRejectedValueOnce(new Error('Error de Redis'));

      const response = await request(app)
        .get('/api/wishlist')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('POST /api/wishlist/items', () => {
    it('debería agregar un item a la lista de deseos', async () => {
      const newItem = {
        productId: 1,
        name: 'Producto 1',
        price: 10.00
      };
      
      mockRedis.sadd.mockResolvedValueOnce(1);
      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.setex.mockResolvedValueOnce('OK');

      const response = await request(app)
        .post('/api/wishlist/items')
        .send(newItem)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Producto agregado a la lista de deseos',
        data: {
          wishlist: {
            userId: 1,
            items: [newItem]
          }
        }
      });
    });

    it('debería devolver error 400 si faltan datos requeridos', async () => {
      const incompleteItem = {
        name: 'Producto sin ID'
      };

      const response = await request(app)
        .post('/api/wishlist/items')
        .send(incompleteItem)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'ID, nombre y precio del producto son requeridos'
      });
    });
  });

  describe('DELETE /api/wishlist/items/:productId', () => {
    it('debería eliminar un item de la lista de deseos', async () => {
      const existingWishlist = {
        userId: 1,
        items: [
          { productId: 1, name: 'Producto 1', price: 10.00 },
          { productId: 2, name: 'Producto 2', price: 15.00 }
        ]
      };
      
      const updatedWishlist = {
        userId: 1,
        items: [
          { productId: 2, name: 'Producto 2', price: 15.00 }
        ]
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingWishlist));
      mockRedis.srem.mockResolvedValueOnce(1);
      mockRedis.setex.mockResolvedValueOnce('OK');

      const response = await request(app)
        .delete('/api/wishlist/items/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Producto eliminado de la lista de deseos',
        data: {
          wishlist: updatedWishlist
        }
      });
    });

    it('debería devolver 404 si el producto no está en la lista de deseos', async () => {
      const existingWishlist = {
        userId: 1,
        items: [{ productId: 2, name: 'Producto 2', price: 15.00 }]
      };
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(existingWishlist));
      mockRedis.srem.mockResolvedValueOnce(0);

      const response = await request(app)
        .delete('/api/wishlist/items/1')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto no encontrado en la lista de deseos'
      });
    });
  });

  describe('DELETE /api/wishlist', () => {
    it('debería limpiar la lista de deseos', async () => {
      mockRedis.del.mockResolvedValueOnce(1);

      const response = await request(app)
        .delete('/api/wishlist')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Lista de deseos vaciada'
      });
    });

    it('debería manejar errores al limpiar la lista de deseos', async () => {
      mockRedis.del.mockRejectedValueOnce(new Error('Error de Redis'));

      const response = await request(app)
        .delete('/api/wishlist')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });
});