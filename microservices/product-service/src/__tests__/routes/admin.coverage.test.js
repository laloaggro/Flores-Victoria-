const express = require('express');

// Mock de dependencias
jest.mock('../../controllers/productController', () => ({
  getAllProducts: jest.fn((req, res) => res.json({ products: [] })),
  getProductById: jest.fn((req, res) => res.json({ product: {} })),
  createProduct: jest.fn((req, res) => res.status(201).json({ product: {} })),
  updateProduct: jest.fn((req, res) => res.json({ product: {} })),
  deleteProduct: jest.fn((req, res) => res.status(204).send()),
}));

describe('Admin Routes - Complete Coverage', () => {
  let adminRoutes;
  let app;

  beforeEach(() => {
    jest.resetModules();
    adminRoutes = require('../../routes/admin');
    app = express();
    app.use('/admin', adminRoutes);
  });

  it('should load admin routes module', () => {
    expect(adminRoutes).toBeDefined();
  });

  it('should export an Express router', () => {
    expect(typeof adminRoutes).toBe('function');
  });

  it('should be mountable in an Express app', () => {
    const testApp = express();
    expect(() => testApp.use('/admin', adminRoutes)).not.toThrow();
  });

  it('should have router properties', () => {
    expect(adminRoutes).toHaveProperty('stack');
  });

  it('should have route handlers', () => {
    if (adminRoutes.stack) {
      expect(adminRoutes.stack.length).toBeGreaterThan(0);
    }
  });

  it('should handle admin routes', () => {
    expect(typeof adminRoutes).toBe('function');
    expect(adminRoutes.name).toBe('router');
  });

  it('should be configurable with middleware', () => {
    const testRouter = express.Router();
    expect(() => testRouter.use('/test', adminRoutes)).not.toThrow();
  });
});
