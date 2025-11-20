const { asyncHandler, notFoundHandler, errorHandler } = require('../../middleware/error-handler');
const { AppError } = require('../../errors/AppError');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test/path',
      url: '/test/path',
      method: 'GET',
      logger: {
        error: jest.fn(),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('asyncHandler', () => {
    it('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should resolve successful async functions', async () => {
      const asyncFn = jest.fn().mockResolvedValue();
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle synchronous functions that return promises', async () => {
      const asyncFn = jest.fn(() => Promise.resolve('success'));
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error with path', () => {
      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot find /test/path on this server',
          statusCode: 404,
        })
      );
    });

    it('should create AppError instance', () => {
      notFoundHandler(req, res, next);

      const calledWith = next.mock.calls[0][0];
      expect(calledWith).toBeInstanceOf(AppError);
    });

    it('should include originalUrl in message', () => {
      req.originalUrl = '/api/nonexistent';
      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('/api/nonexistent'),
        })
      );
    });
  });

  describe('errorHandler', () => {
    it('should send error response with status code', () => {
      const error = new AppError('Test error', 400);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: 400,
          message: 'Test error',
        })
      );
    });

    it('should default to 500 status code', () => {
      const error = new Error('Internal error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should log error with logger if available', () => {
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(req.logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error',
          url: '/test/path',
          method: 'GET',
        })
      );
    });

    it('should use console.error if no logger', () => {
      delete req.logger;
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith('Error occurred:', error);
    });

    it('should handle Mongoose CastError', () => {
      const error = new Error('Cast error');
      error.name = 'CastError';

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Resource not found',
          statusCode: 404,
        })
      );
    });

    it('should handle duplicate key error (code 11000)', () => {
      const error = new Error('Duplicate key');
      error.code = 11000;

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Duplicate field value entered',
          statusCode: 400,
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        field1: { message: 'Field1 is required' },
        field2: { message: 'Field2 is invalid' },
      };

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Field1 is required, Field2 is invalid',
          statusCode: 400,
        })
      );
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'Error stack trace',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');

      errorHandler(error, req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('stack');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
