/**
 * Error Handler Middleware Tests
 * 
 * Tests para validar el comportamiento del middleware de manejo de errores
 */

const { errorHandler, notFoundHandler, asyncHandler } = require('../error-handler');
const { AppError, BadRequestError, NotFoundError, ValidationError } = require('../../errors/AppError');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/test',
      originalUrl: '/test',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
      log: {
        error: jest.fn(),
        warn: jest.fn(),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('asyncHandler', () => {
    test('should call next with error when async function throws', async () => {
      const error = new Error('Test error');
      const handler = asyncHandler(async () => {
        throw error;
      });

      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test('should call next with error when promise rejects', async () => {
      const error = new Error('Promise rejection');
      const handler = asyncHandler(async () => {
        return Promise.reject(error);
      });

      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test('should not call next when async function succeeds', async () => {
      const handler = asyncHandler(async (req, res) => {
        res.json({ success: true });
      });

      await handler(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('errorHandler', () => {
    test('should handle AppError with correct status and format', () => {
      const error = new BadRequestError('Invalid input', { field: 'email' });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid input',
        code: 'BAD_REQUEST',
        metadata: { field: 'email' },
      });
    });

    test('should handle ValidationError with structured errors', () => {
      const error = new ValidationError([
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' },
      ]);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'fail',
          code: 'VALIDATION_ERROR',
          errors: [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password too short' },
          ],
        })
      );
    });

    test('should handle MongoDB duplicate key error (11000)', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'fail',
          code: 'CONFLICT',
          message: expect.stringContaining('already exists'),
        })
      );
    });

    test('should handle Mongoose validation error', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          name: { message: 'Name is required' },
        },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'fail',
          code: 'VALIDATION_ERROR',
        })
      );
    });

    test('should handle JWT errors', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'invalid token',
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'fail',
          code: 'UNAUTHORIZED',
          message: 'Token inválido',
        })
      );
    });

    test('should handle generic errors as 500', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error interno del servidor',
        })
      );
    });

    test('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    test('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    test('should log error with request logger', () => {
      const error = new Error('Test error');
      errorHandler(error, req, res, next);

      expect(req.log.error).toHaveBeenCalledWith(
        'Error occurred',
        expect.objectContaining({
          message: 'Test error',
          method: 'GET',
          path: '/test',
        })
      );
    });
  });

  describe('notFoundHandler', () => {
    test('should respond with 404 Not Found', () => {
      req.originalUrl = '/api/unknown';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Ruta no encontrada: /api/unknown',
        code: 'NOT_FOUND',
      });
    });

    test('should use default logger if req.log is not available', () => {
      delete req.log;
      req.originalUrl = '/api/unknown';

      expect(() => notFoundHandler(req, res)).not.toThrow();
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

// Mock setup for Jest
if (typeof jest !== 'undefined') {
  global.jest = jest;
}
