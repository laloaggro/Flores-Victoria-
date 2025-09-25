const request = require('supertest');
const express = require('express');
const ProductController = require('../../controllers/productController');
const Product = require('../../models/Product');

// Crear una aplicación Express para pruebas
const app = express();
app.use(express.json());

// Mock de la base de datos para pruebas de integración
let mockDb;

// Inicializar el controlador con una base de datos mock
let productController;

// Middleware para inyectar la base de datos mock
app.use((req, res, next) => {
  req.db = mockDb;
  next();
});

// Inicializar controladores con base de datos mock
app.use((req, res, next) => {
  productController = new ProductController(req.db);
  next();
});

// Rutas para pruebas
app.get('/api/products', (req, res) => {
  productController.getAllProducts(req, res);
});

app.get('/api/products/:id', (req, res) => {
  productController.getProductById(req, res);
});

app.post('/api/products', (req, res) => {
  productController.createProduct(req, res);
});

app.put('/api/products/:id', (req, res) => {
  productController.updateProduct(req, res);
});

app.delete('/api/products/:id', (req, res) => {
  productController.deleteProduct(req, res);
});

describe('Product Service Integration Tests', () => {
  beforeEach(() => {
    // Crear una base de datos mock para cada prueba
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([]),
      insertOne: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('debería obtener una lista de productos', async () => {
      const mockProducts = [
        { id: '1', name: 'Producto 1', price: 100 },
        { id: '2', name: 'Producto 2', price: 200 }
      ];
      
      mockDb.toArray.mockResolvedValueOnce(mockProducts);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          products: mockProducts
        }
      });
    });

    it('debería manejar errores al obtener productos', async () => {
      mockDb.toArray.mockRejectedValueOnce(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Error interno del servidor'
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería obtener un producto por ID', async () => {
      const mockProduct = { id: '1', name: 'Producto 1', price: 100 };
      mockDb.findOne.mockResolvedValueOnce(mockProduct);

      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          product: mockProduct
        }
      });
    });

    it('debería devolver 404 si el producto no existe', async () => {
      mockDb.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto no encontrado'
      });
    });
  });

  describe('POST /api/products', () => {
    it('debería crear un nuevo producto', async () => {
      const newProduct = {
        name: 'Nuevo Producto',
        price: 150,
        description: 'Descripción del producto'
      };

      const insertedProduct = {
        id: '1',
        ...newProduct,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      };

      mockDb.insertOne.mockResolvedValueOnce({ insertedId: '1', ops: [insertedProduct] });

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Producto creado exitosamente');
      expect(response.body.data.product).toMatchObject({
        id: '1',
        name: 'Nuevo Producto',
        price: 150,
        description: 'Descripción del producto'
      });
    });

    it('debería devolver error si faltan campos requeridos', async () => {
      const incompleteProduct = {
        description: 'Descripción sin nombre ni precio'
      };

      const response = await request(app)
        .post('/api/products')
        .send(incompleteProduct)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Nombre y precio son requeridos'
      });
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debería actualizar un producto existente', async () => {
      const existingProduct = { id: '1', name: 'Producto Existente', price: 100 };
      const updatedProduct = {
        id: '1',
        name: 'Producto Actualizado',
        price: 200
      };

      // Mock para verificar que el producto existe
      mockDb.findOne.mockResolvedValueOnce(existingProduct);
      // Mock para la actualización
      mockDb.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });
      // Mock para obtener el producto actualizado
      mockDb.findOne.mockResolvedValueOnce(updatedProduct);

      const response = await request(app)
        .put('/api/products/1')
        .send({ name: 'Producto Actualizado', price: 200 })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Producto actualizado exitosamente');
      expect(response.body.data.product).toMatchObject({
        id: '1',
        name: 'Producto Actualizado',
        price: 200
      });
    });

    it('debería devolver 404 si el producto a actualizar no existe', async () => {
      mockDb.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/products/999')
        .send({ name: 'Producto Actualizado' })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto no encontrado'
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería eliminar un producto', async () => {
      const existingProduct = { id: '1', name: 'Producto a Eliminar', price: 100 };
      
      // Mock para verificar que el producto existe
      mockDb.findOne.mockResolvedValueOnce(existingProduct);
      // Mock para la eliminación
      mockDb.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const response = await request(app)
        .delete('/api/products/1')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Producto eliminado correctamente'
      });
    });

    it('debería devolver 404 si el producto a eliminar no existe', async () => {
      mockDb.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/products/999')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Producto no encontrado'
      });
    });
  });
});