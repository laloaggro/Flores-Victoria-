/**
 * Tests para auth.js middleware del notification-service
 */

const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware - Notification Service', () => {
  let authenticateToken;
  let optionalAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const auth = require('../../middleware/auth');
    authenticateToken = auth.authenticateToken;
    optionalAuth = auth.optionalAuth;
  });

  describe('authenticateToken', () => {
    it('should be defined', () => {
      expect(authenticateToken).toBeDefined();
      expect(typeof authenticateToken).toBe('function');
    });

    it('should authenticate valid token', () => {
      const req = {
        headers: { authorization: 'Bearer valid-token' },
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

    it('should reject missing token', () => {
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

    it('should reject invalid token', () => {
      const req = {
        headers: { authorization: 'Bearer invalid' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(new Error('Invalid'), null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle malformed authorization header', () => {
      const req = {
        headers: { authorization: 'InvalidFormat' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('optionalAuth', () => {
    it('should be defined', () => {
      expect(optionalAuth).toBeDefined();
      expect(typeof optionalAuth).toBe('function');
    });

    it('should set user with valid token', () => {
      const req = {
        headers: { authorization: 'Bearer valid' },
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
        headers: { authorization: 'Bearer invalid' },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(new Error('Invalid'), null);
      });

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should not throw on malformed header', () => {
      const req = {
        headers: { authorization: 'Malformed' },
      };
      const res = {};
      const next = jest.fn();

      expect(() => {
        optionalAuth(req, res, next);
      }).not.toThrow();

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from Bearer format', () => {
      const req = {
        headers: { authorization: 'Bearer test-token-123' },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        expect(token).toBe('test-token-123');
        callback(null, { userId: '123' });
      });

      authenticateToken(req, res, next);
    });

    it('should handle different case Bearer', () => {
      const req = {
        headers: { authorization: 'bearer lower-case-token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      // Debería rechazar o manejar apropiadamente
      expect(res.status).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle expired tokens', () => {
      const req = {
        headers: { authorization: 'Bearer expired-token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        callback(error, null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle JsonWebTokenError', () => {
      const req = {
        headers: { authorization: 'Bearer malformed-token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        const error = new Error('Malformed JWT');
        error.name = 'JsonWebTokenError';
        callback(error, null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle generic verification errors', () => {
      const req = {
        headers: { authorization: 'Bearer test-token' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(new Error('Generic error'), null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with service-to-service auth', () => {
      const req = {
        headers: { authorization: 'Bearer service-token' },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(null, { serviceId: 'user-service', type: 'service' });
      });

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should preserve user data in request', () => {
      const userData = {
        userId: '123',
        email: 'test@example.com',
        role: 'admin',
      };

      const req = {
        headers: { authorization: 'Bearer test-token' },
      };
      const res = {};
      const next = jest.fn();

      jwt.verify = jest.fn((token, secret, callback) => {
        callback(null, userData);
      });

      authenticateToken(req, res, next);

      expect(req.user).toEqual(userData);
    });
  });
});
