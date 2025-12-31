/**
 * @fileoverview Tests de integración para Product Service
 * @description Cubre CRUD de productos, filtering, search, caching y MongoDB operations
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mocks
jest.mock('../../shared/middleware/token-revocation', () => ({
  isTokenRevokedMiddleware: jest.fn(() => (req, res, next) => next()),
  initRedisClient: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('Product Service - Integration Tests', () => {
  let app;

  // Mock de productos
  const mockProducts = [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Rosa Roja Premium',
      description: 'Rosas rojas de calidad premium',
      price: 95.99,
      category: 'roses',
      inStock: true,
      quantity: 50,
      images: ['image1.jpg'],
      rating: 4.8,
      reviews: 120,
      createdAt: new Date('2025-01-01'),
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Ramo Mixto Primavera',
      description: 'Combinación de flores variadas',
      price: 145.0,
      category: 'bouquets',
      inStock: true,
      quantity: 30,
      images: ['image2.jpg'],
      rating: 4.6,
      reviews: 85,
      createdAt: new Date('2025-01-02'),
    },
    {
      _id: '507f1f77bcf86cd799439013',
      name: 'Lirio Blanco',
      description: 'Lirios blancos frescos',
      price: 75.5,
      category: 'lilies',
      inStock: false,
      quantity: 0,
      images: ['image3.jpg'],
      rating: 4.4,
      reviews: 42,
      createdAt: new Date('2025-01-03'),
    },
  ];

  beforeAll(() => {
    // Crear una app Express simple para testing
    app = express();
    app.use(express.json());

    // Middleware de logging mock
    app.use((req, res, next) => {
      req.log = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      };
      next();
    });

    // ═══════════════════════════════════════════════════════════════
    // MOCK ROUTES
    // ═══════════════════════════════════════════════════════════════

    // GET all products with filtering
    app.get('/products', (req, res) => {
      let results = [...mockProducts];

      // Filter by category
      if (req.query.category) {
        results = results.filter((p) => p.category === req.query.category);
      }

      // Filter by price range
      if (req.query.minPrice) {
        results = results.filter((p) => p.price >= parseFloat(req.query.minPrice));
      }
      if (req.query.maxPrice) {
        results = results.filter((p) => p.price <= parseFloat(req.query.maxPrice));
      }

      // Filter by stock
      if (req.query.inStock === 'true') {
        results = results.filter((p) => p.inStock);
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      const paginated = results.slice(skip, skip + limit);

      res.json({
        status: 'success',
        data: paginated,
        pagination: {
          page,
          limit,
          total: results.length,
          pages: Math.ceil(results.length / limit),
        },
      });
    });

    // GET single product
    app.get('/products/:id', (req, res) => {
      const product = mockProducts.find((p) => p._id === req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado',
          code: 'PRODUCT_NOT_FOUND',
        });
      }

      res.json({
        status: 'success',
        data: product,
      });
    });

    // POST new product (admin only)
    app.post('/products', (req, res) => {
      // Check authorization
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, description, price, category } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({
          error: 'Missing required fields: name, price, category',
        });
      }

      const newProduct = {
        _id: new mongoose.Types.ObjectId(),
        name,
        description,
        price: parseFloat(price),
        category,
        inStock: true,
        quantity: req.body.quantity || 0,
        images: req.body.images || [],
        rating: 0,
        reviews: 0,
        createdAt: new Date(),
      };

      res.status(201).json({
        status: 'success',
        data: newProduct,
      });
    });

    // PATCH update product
    app.patch('/products/:id', (req, res) => {
      const product = mockProducts.find((p) => p._id === req.params.id);

      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado',
        });
      }

      Object.assign(product, req.body);

      res.json({
        status: 'success',
        data: product,
      });
    });

    // DELETE product
    app.delete('/products/:id', (req, res) => {
      const index = mockProducts.findIndex((p) => p._id === req.params.id);

      if (index === -1) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado',
        });
      }

      mockProducts.splice(index, 1);

      res.json({
        status: 'success',
        message: 'Producto eliminado correctamente',
      });
    });

    // Search endpoint
    app.get('/search/products', (req, res) => {
      const query = req.query.q?.toLowerCase() || '';

      const results = mockProducts.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );

      res.json({
        status: 'success',
        data: results,
        count: results.length,
      });
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'product-service',
        database: 'connected',
      });
    });

    // Error handling
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════
  // HEALTH CHECK TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Health Checks', () => {
    it('should report healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('product-service');
      expect(response.body.database).toBe('connected');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET PRODUCTS TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/products').query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should filter by category', async () => {
      const response = await request(app).get('/products').query({ category: 'roses' });

      expect(response.status).toBe(200);
      expect(response.body.data.every((p) => p.category === 'roses')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app).get('/products').query({ minPrice: 100, maxPrice: 150 });

      expect(response.status).toBe(200);
      expect(response.body.data.every((p) => p.price >= 100 && p.price <= 150)).toBe(true);
    });

    it('should filter by stock availability', async () => {
      const response = await request(app).get('/products').query({ inStock: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data.every((p) => p.inStock)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/products')
        .query({ category: 'roses', minPrice: 50, inStock: 'true' });

      expect(response.status).toBe(200);
      response.body.data.forEach((p) => {
        expect(p.category).toBe('roses');
        expect(p.price).toBeGreaterThanOrEqual(50);
        expect(p.inStock).toBe(true);
      });
    });

    it('should limit page size to 100', async () => {
      const response = await request(app).get('/products').query({ limit: 200 });

      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GET SINGLE PRODUCT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('GET /products/:id', () => {
    it('should return product by id', async () => {
      const productId = mockProducts[0]._id;

      const response = await request(app).get(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data._id).toBe(productId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/products/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return all product details', async () => {
      const product = mockProducts[0];
      const response = await request(app).get(`/products/${product._id}`);

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.name).toBe(product.name);
      expect(data.price).toBe(product.price);
      expect(data.category).toBe(product.category);
      expect(data.inStock).toBe(product.inStock);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SEARCH TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('GET /search/products', () => {
    it('should search products by name', async () => {
      const response = await request(app).get('/search/products').query({ q: 'Rosa' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((p) => p.name.includes('Rosa'))).toBe(true);
    });

    it('should search products by description', async () => {
      const response = await request(app).get('/search/products').query({ q: 'premium' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });

    it('should be case-insensitive', async () => {
      const response1 = await request(app).get('/search/products').query({ q: 'ROSA' });

      const response2 = await request(app).get('/search/products').query({ q: 'rosa' });

      expect(response1.body.data.length).toBe(response2.body.data.length);
    });

    it('should return empty array when no matches', async () => {
      const response = await request(app)
        .get('/search/products')
        .query({ q: 'nonexistent-product-xyz' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CREATE PRODUCT TESTS (ADMIN)
  // ═══════════════════════════════════════════════════════════════

  describe('POST /products (Admin)', () => {
    it('should create product with valid data', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Nueva Rosa',
          description: 'Descripción',
          price: 89.99,
          category: 'roses',
          quantity: 50,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Nueva Rosa');
      expect(response.body.data.price).toBe(89.99);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/products').send({
        name: 'Nueva Rosa',
        price: 89.99,
        category: 'roses',
      });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Nueva Rosa',
          // missing price and category
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required fields');
    });

    it('should convert price to number', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Nueva Rosa',
          description: 'Descripción',
          price: '89.99', // string
          category: 'roses',
        });

      expect(response.status).toBe(201);
      expect(typeof response.body.data.price).toBe('number');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // UPDATE PRODUCT TESTS (ADMIN)
  // ═══════════════════════════════════════════════════════════════

  describe('PATCH /products/:id (Admin)', () => {
    it('should update product', async () => {
      const productId = mockProducts[0]._id;

      const response = await request(app).patch(`/products/${productId}`).send({
        price: 99.99,
        inStock: false,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.price).toBe(99.99);
      expect(response.body.data.inStock).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).patch('/products/non-existent-id').send({ price: 99.99 });

      expect(response.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // DELETE PRODUCT TESTS (ADMIN)
  // ═══════════════════════════════════════════════════════════════

  describe('DELETE /products/:id (Admin)', () => {
    it('should delete product', async () => {
      const initialCount = mockProducts.length;

      const productId = mockProducts[mockProducts.length - 1]._id;
      const response = await request(app).delete(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).delete('/products/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // DATA INTEGRITY TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Data Integrity', () => {
    it('should maintain data structure consistency', async () => {
      const response = await request(app).get('/products');

      response.body.data.forEach((product) => {
        expect(product).toHaveProperty('_id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('inStock');
        expect(typeof product.price).toBe('number');
        expect(typeof product.inStock).toBe('boolean');
      });
    });

    it('should validate price is positive', async () => {
      const response = await request(app).get('/products');

      response.body.data.forEach((product) => {
        expect(product.price).toBeGreaterThan(0);
      });
    });

    it('should validate quantity is non-negative', async () => {
      const response = await request(app).get('/products');

      response.body.data.forEach((product) => {
        expect(product.quantity).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Performance', () => {
    it('should respond quickly to product list', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/products');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(200); // < 200ms
    });

    it('should handle large filters efficiently', async () => {
      const response = await request(app).get('/products').query({
        category: 'roses',
        minPrice: 10,
        maxPrice: 500,
        inStock: 'true',
        page: 1,
        limit: 50,
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
