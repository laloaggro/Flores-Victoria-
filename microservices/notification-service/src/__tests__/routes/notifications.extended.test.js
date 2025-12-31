/**
 * Tests adicionales para notifications.routes.js
 */

const request = require('supertest');
const express = require('express');

describe('Notification Routes - Extended Coverage', () => {
  let app;
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Mock de emailService
    jest.mock('../../services/email.service', () => ({
      sendEmail: jest.fn().mockResolvedValue({ success: true }),
    }));

    // Mock de auth middleware
    jest.mock('../../middleware/auth', () => ({
      authenticateToken: (req, res, next) => {
        req.user = { userId: '123', role: 'admin' };
        next();
      },
      optionalAuth: (req, res, next) => next(),
    }));

    router = require('../../routes/notifications.routes');
    app = express();
    app.use(express.json());
    app.use('/api/notifications', router);
  });

  describe('Route Configuration', () => {
    it('should have router defined', () => {
      expect(router).toBeDefined();
    });

    it('should have POST routes', () => {
      const postRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.post
      );
      expect(postRoutes.length).toBeGreaterThan(0);
    });

    it('should have GET routes', () => {
      const getRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.get
      );
      expect(getRoutes.length).toBeGreaterThan(0);
    });
  });

  describe('Route Paths', () => {
    it('should have email endpoint', () => {
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => layer.route.path);
      
      expect(routes).toContain('/email');
    });

    it('should have health endpoint', () => {
      const routes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => layer.route.path);
      
      const hasHealthRoute = routes.some((path) => path.includes('health'));
      expect(hasHealthRoute).toBe(true);
    });
  });

  describe('Middleware Stack', () => {
    it('should have authentication middleware', () => {
      const authMiddleware = router.stack.filter(
        (layer) => layer.name === 'authenticateToken'
      );
      expect(authMiddleware.length).toBeGreaterThan(0);
    });
  });
});
