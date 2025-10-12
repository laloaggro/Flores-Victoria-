const axios = require('axios');
const { authenticateToken } = require('../../microservices/api-gateway/src/middleware/auth');
const { logRequest } = require('../../microservices/api-gateway/src/middleware/logger');
const ServiceProxy = require('../../microservices/api-gateway/src/utils/proxy');

// Mock de axios
jest.mock('axios');
// Mock de winston
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn()
  }),
  transports: {
    Console: jest.fn()
  }
}));

describe('API Gateway - Unit Tests', () => {
  describe('Authentication Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should return 401 when no token is provided', () => {
      authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Token no proporcionado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 when token is invalid', () => {
      req.headers['authorization'] = 'Bearer invalidToken';
      jest.mock('jsonwebtoken', () => ({
        verify: jest.fn((token, secret, callback) => {
          callback(new Error('Invalid token'), null);
        })
      }));
      
      // Reiniciar el módulo para aplicar el mock
      jest.resetModules();
      const { authenticateToken } = require('../../microservices/api-gateway/src/middleware/auth');
      
      authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Token inválido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should call next when token is valid', () => {
      req.headers['authorization'] = 'Bearer validToken';
      const user = { id: 1, email: 'test@example.com' };
      
      jest.mock('jsonwebtoken', () => ({
        verify: jest.fn((token, secret, callback) => {
          callback(null, user);
        })
      }));
      
      // Reiniciar el módulo para aplicar el mock
      jest.resetModules();
      const { authenticateToken } = require('../../microservices/api-gateway/src/middleware/auth');
      
      authenticateToken(req, res, next);
      
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Logger Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        method: 'GET',
        url: '/test',
        headers: {}
      };
      res = {};
      next = jest.fn();
    });

    test('should log request and call next', () => {
      logRequest(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Service Proxy', () => {
    let req, res;

    beforeEach(() => {
      req = {
        method: 'GET',
        url: '/test',
        headers: {},
        body: {},
        query: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    test('should route request to service successfully', async () => {
      const serviceUrl = 'http://localhost:3001';
      const mockResponse = {
        status: 200,
        data: { message: 'Success' }
      };
      
      axios.mockResolvedValue(mockResponse);
      
      await ServiceProxy.routeToService(serviceUrl, req, res);
      
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: `${serviceUrl}/test`,
        headers: {
          host: undefined
        },
        data: {},
        params: {}
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
    });

    test('should handle service error', async () => {
      const serviceUrl = 'http://localhost:3001';
      const error = new Error('Service unavailable');
      
      axios.mockRejectedValue(error);
      
      await ServiceProxy.routeToService(serviceUrl, req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al conectar con el servicio'
      });
    });
  });
});