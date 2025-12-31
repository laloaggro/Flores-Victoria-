/**
 * Tests simples para auth.js middleware del notification-service
 */

const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware - Notification Service (Simple)', () => {
  let serviceAuth;
  let readAuth;
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    const auth = require('../../middleware/auth');
    serviceAuth = auth.serviceAuth;
    readAuth = auth.readAuth;

    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('serviceAuth', () => {
    it('should be defined', () => {
      expect(serviceAuth).toBeDefined();
      expect(typeof serviceAuth).toBe('function');
    });

    it('should authenticate with valid API key', () => {
      req.headers['x-api-key'] = 'internal_service_key';

      serviceAuth(req, res, next);

      expect(req.service).toEqual({ type: 'internal', authenticated: true });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with valid JWT token', () => {
      const mockDecoded = { userId: 'user123', email: 'test@test.com', role: 'admin' };
      jwt.verify.mockReturnValue(mockDecoded);

      req.headers.authorization = 'Bearer valid-token';

      serviceAuth(req, res, next);

      expect(req.user).toEqual({
        id: 'user123',
        email: 'test@test.com',
        role: 'admin',
      });
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing authentication', () => {
      serviceAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Autenticación requerida',
        code: 'UNAUTHORIZED',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid JWT token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      req.headers.authorization = 'Bearer invalid-token';

      serviceAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('readAuth (optional auth)', () => {
    it('should be defined', () => {
      expect(readAuth).toBeDefined();
      expect(typeof readAuth).toBe('function');
    });

    it('should require authentication (not optional)', () => {
      readAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token requerido',
        code: 'MISSING_TOKEN',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set user with valid token', () => {
      const mockDecoded = { userId: 'user456', email: 'user@test.com' };
      jwt.verify.mockReturnValue(mockDecoded);

      req.headers.authorization = 'Bearer valid-token';

      readAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      req.headers.authorization = 'Bearer invalid-token';

      readAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Aliases for compatibility', () => {
    it('should export authenticateToken as alias for serviceAuth', () => {
      const auth = require('../../middleware/auth');
      expect(auth.authenticateToken).toBe(auth.serviceAuth);
    });

    it('should export optionalAuth as alias for readAuth', () => {
      const auth = require('../../middleware/auth');
      expect(auth.optionalAuth).toBe(auth.readAuth);
    });
  });
});
