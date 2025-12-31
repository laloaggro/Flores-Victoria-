/**
 * Tests para wishlist.js routes (mejorar cobertura)
 */

const express = require('express');

// Mock de modelos y dependencias
jest.mock('../../models/Wishlist', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
}));

describe('Wishlist Routes - Extended Coverage', () => {
  let router;
  let setRedis;
  let Wishlist;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    Wishlist = require('../../models/Wishlist');
    const wishlistModule = require('../../routes/wishlist');
    router = wishlistModule.router;
    setRedis = wishlistModule.setRedis;
  });

  describe('Router Setup', () => {
    it('should export router', () => {
      expect(router).toBeDefined();
    });

    it('should export setRedis function', () => {
      expect(setRedis).toBeDefined();
      expect(typeof setRedis).toBe('function');
    });

    it('should call setRedis with client', () => {
      const mockClient = { ping: jest.fn() };
      expect(() => setRedis(mockClient)).not.toThrow();
    });
  });

  describe('Route Middleware Configuration', () => {
    it('should have POST routes configured', () => {
      const app = express();
      app.use('/api/wishlist', router);
      
      expect(router.stack).toBeDefined();
      const postRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.post
      );
      expect(postRoutes.length).toBeGreaterThan(0);
    });

    it('should have GET routes configured', () => {
      const app = express();
      app.use('/api/wishlist', router);
      
      const getRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.get
      );
      expect(getRoutes.length).toBeGreaterThan(0);
    });

    it('should have DELETE routes configured', () => {
      const app = express();
      app.use('/api/wishlist', router);
      
      const deleteRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.delete
      );
      expect(deleteRoutes.length).toBeGreaterThan(0);
    });

    it('should have PUT routes configured', () => {
      const app = express();
      app.use('/api/wishlist', router);
      
      const putRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.put
      );
      expect(putRoutes.length).toBeGreaterThan(0);
    });
  });

  describe('Route Paths', () => {
    it('should have root GET route', () => {
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));
      
      const rootRoute = routes.find((r) => r.path === '/' && r.methods.includes('get'));
      expect(rootRoute).toBeDefined();
    });

    it('should have POST route for adding items', () => {
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));
      
      const postRoute = routes.find((r) => r.path === '/' && r.methods.includes('post'));
      expect(postRoute).toBeDefined();
    });

    it('should have DELETE route with parameter', () => {
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));
      
      const deleteRoute = routes.find((r) => r.path.includes(':') && r.methods.includes('delete'));
      expect(deleteRoute).toBeDefined();
    });
  });
});
