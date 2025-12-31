/**
 * Tests adicionales para auth.js middleware del contact-service
 */

const jwt = require('jsonwebtoken');

// Mock de dependencias
jest.mock('jsonwebtoken');

describe('Auth Middleware - Contact Service (Extended)', () => {
  let authenticateToken;
  let adminOnly;
  let optionalAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const authMiddleware = require('../../middleware/auth');
    authenticateToken = authMiddleware.authenticateToken;
    adminOnly = authMiddleware.adminOnly;
    optionalAuth = authMiddleware.optionalAuth;
  });

  describe('authenticateToken', () => {
    it('should be defined', () => {
      expect(authenticateToken).toBeDefined();
      expect(typeof authenticateToken).toBe('function');
    });

    it('should call next with valid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(null, { userId: '123', role: 'user' });
      });

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 without authorization header', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 with invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('adminOnly', () => {
    it('should be defined', () => {
      expect(adminOnly).toBeDefined();
      expect(typeof adminOnly).toBe('function');
    });

    it('should allow admin users', () => {
      const req = {
        user: { role: 'admin' },
      };
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should block non-admin users', () => {
      const req = {
        user: { role: 'user' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing user object', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('optionalAuth', () => {
    it('should be defined', () => {
      expect(optionalAuth).toBeDefined();
      expect(typeof optionalAuth).toBe('function');
    });

    it('should set user with valid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(null, { userId: '123' });
      });

      optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without token', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should continue with invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
