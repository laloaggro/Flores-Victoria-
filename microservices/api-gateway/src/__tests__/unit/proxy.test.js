const axios = require('axios');
const ServiceProxy = require('../../utils/proxy');
const { logger } = require('../../middleware/logger');

// Mock de axios y logger
jest.mock('axios');
jest.mock('../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ServiceProxy - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'test-123',
      },
      body: {},
      query: {},
      id: 'test-123',
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('routeToService - Success Cases', () => {
    it('should successfully proxy a GET request', async () => {
      const serviceUrl = 'http://test-service:3000';
      const mockResponse = {
        status: 200,
        data: { message: 'Success' },
      };

      axios.mockResolvedValue(mockResponse);

      await ServiceProxy.routeToService(serviceUrl, req, res);

      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: `${serviceUrl}${req.url}`,
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'x-request-id': 'test-123',
        }),
        data: {},
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should successfully proxy a POST request with body', async () => {
      req.method = 'POST';
      req.body = { name: 'Test', email: 'test@example.com' };

      const mockResponse = {
        status: 201,
        data: { id: 1, name: 'Test' },
      };

      axios.mockResolvedValue(mockResponse);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: req.body,
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Test' });
    });

    it('should use request id from headers if req.id is not available', async () => {
      delete req.id;

      axios.mockResolvedValue({
        status: 200,
        data: {},
      });

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-request-id': 'test-123',
          }),
        })
      );
    });

    it('should handle different HTTP methods', async () => {
      const methods = ['PUT', 'PATCH', 'DELETE'];

      for (const method of methods) {
        jest.clearAllMocks();
        req.method = method;

        axios.mockResolvedValue({
          status: 200,
          data: {},
        });

        await ServiceProxy.routeToService('http://service:3000', req, res);

        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            method,
          })
        );
      }
    });
  });

  describe('routeToService - Network Error Handling', () => {
    it('should handle ECONNREFUSED error in test environment', async () => {
      process.env.NODE_ENV = 'test';

      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('test'),
        })
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle ECONNREFUSED error in production environment', async () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Servicio temporalmente no disponible',
        })
      );
    });

    it('should handle EAI_AGAIN DNS error', async () => {
      const error = new Error('DNS lookup failed');
      error.code = 'EAI_AGAIN';
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        })
      );
    });

    it('should handle ENOTFOUND error', async () => {
      const error = new Error('Service not found');
      error.code = 'ENOTFOUND';
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        })
      );
    });

    it('should handle ETIMEDOUT error', async () => {
      const error = new Error('Request timeout');
      error.code = 'ETIMEDOUT';
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        })
      );
    });

    it('should handle all network error codes', async () => {
      const networkErrorCodes = [
        'ECONNREFUSED',
        'EAI_AGAIN',
        'ENOTFOUND',
        'ECONNRESET',
        'ETIMEDOUT',
        'EHOSTUNREACH',
        'EPIPE',
      ];

      for (const errorCode of networkErrorCodes) {
        jest.clearAllMocks();

        const error = new Error(`Network error: ${errorCode}`);
        error.code = errorCode;
        axios.mockRejectedValue(error);

        await ServiceProxy.routeToService('http://service:3000', req, res);

        expect(res.status).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
      }
    });
  });

  describe('routeToService - HTTP Error Handling', () => {
    it('should handle 404 response from service', async () => {
      const error = new Error('Not found');
      error.response = {
        status: 404,
        data: { message: 'Resource not found' },
      };
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Ruta no encontrada',
      });
    });

    it('should handle 400 Bad Request', async () => {
      const error = new Error('Bad request');
      error.response = {
        status: 400,
        data: { message: 'Invalid input' },
      };
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input' });
    });

    it('should handle 401 Unauthorized', async () => {
      const error = new Error('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Authentication required' },
      };
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    });

    it('should handle 500 Internal Server Error', async () => {
      const error = new Error('Internal server error');
      error.response = {
        status: 500,
        data: { message: 'Server error' },
      };
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('routeToService - Generic Error Handling', () => {
    it('should handle generic errors without response', async () => {
      const error = new Error('Unknown error');
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
        requestId: 'test-123',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should include request id in error responses', async () => {
      const error = new Error('Test error');
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'test-123',
        })
      );
    });
  });

  describe('routeToService - Header Management', () => {
    it('should remove host header to avoid conflicts', async () => {
      req.headers.host = 'localhost:3000';

      axios.mockResolvedValue({
        status: 200,
        data: {},
      });

      await ServiceProxy.routeToService('http://service:3000', req, res);

      const axiosCall = axios.mock.calls[0][0];
      expect(axiosCall.headers.host).toBeUndefined();
    });

    it('should preserve other headers', async () => {
      req.headers = {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
        'x-custom-header': 'custom-value',
      };

      axios.mockResolvedValue({
        status: 200,
        data: {},
      });

      await ServiceProxy.routeToService('http://service:3000', req, res);

      const axiosCall = axios.mock.calls[0][0];
      expect(axiosCall.headers['content-type']).toBe('application/json');
      expect(axiosCall.headers['authorization']).toBe('Bearer token123');
      expect(axiosCall.headers['x-custom-header']).toBe('custom-value');
    });

    it('should add x-request-id header', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: {},
      });

      await ServiceProxy.routeToService('http://service:3000', req, res);

      const axiosCall = axios.mock.calls[0][0];
      expect(axiosCall.headers['x-request-id']).toBe('test-123');
    });
  });

  describe('routeToService - Logging', () => {
    it('should log request information', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: {},
      });

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Enviando solicitud'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
          body: expect.any(Object),
          query: expect.any(Object),
        })
      );
    });

    it('should log errors with details', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      axios.mockRejectedValue(error);

      await ServiceProxy.routeToService('http://service:3000', req, res);

      expect(logger.error).toHaveBeenCalledWith(
        'Error en proxy a microservicio:',
        expect.objectContaining({
          serviceUrl: 'http://service:3000',
          targetUrl: expect.any(String),
          error: 'Test error',
          stack: expect.any(String),
        })
      );
    });
  });
});
