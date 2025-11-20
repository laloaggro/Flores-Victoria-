const {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} = require('../../errors/AppError');

describe('AppError', () => {
  it('should create error with message and status code', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
  });

  it('should default to operational error', () => {
    const error = new AppError('Test error', 500);

    expect(error.isOperational).toBe(true);
  });

  it('should allow non-operational errors', () => {
    const error = new AppError('Fatal error', 500, false);

    expect(error.isOperational).toBe(false);
  });

  it('should set status to "fail" for 4xx errors', () => {
    const error400 = new AppError('Bad request', 400);
    const error404 = new AppError('Not found', 404);

    expect(error400.status).toBe('fail');
    expect(error404.status).toBe('fail');
  });

  it('should set status to "error" for 5xx errors', () => {
    const error500 = new AppError('Server error', 500);
    const error503 = new AppError('Service unavailable', 503);

    expect(error500.status).toBe('error');
    expect(error503.status).toBe('error');
  });

  it('should be an instance of Error', () => {
    const error = new AppError('Test', 400);

    expect(error).toBeInstanceOf(Error);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test', 400);

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});

describe('NotFoundError', () => {
  it('should create 404 error with default message', () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should allow custom message', () => {
    const error = new NotFoundError('User not found');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('should be instance of AppError', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(AppError);
  });
});

describe('BadRequestError', () => {
  it('should create 400 error with default message', () => {
    const error = new BadRequestError();

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
  });

  it('should allow custom message', () => {
    const error = new BadRequestError('Invalid input');

    expect(error.message).toBe('Invalid input');
  });
});

describe('UnauthorizedError', () => {
  it('should create 401 error with default message', () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('should allow custom message', () => {
    const error = new UnauthorizedError('Invalid token');

    expect(error.message).toBe('Invalid token');
  });
});

describe('ForbiddenError', () => {
  it('should create 403 error with default message', () => {
    const error = new ForbiddenError();

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });

  it('should allow custom message', () => {
    const error = new ForbiddenError('Access denied');

    expect(error.message).toBe('Access denied');
  });
});

describe('ConflictError', () => {
  it('should create 409 error with default message', () => {
    const error = new ConflictError();

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Conflict');
  });

  it('should allow custom message', () => {
    const error = new ConflictError('Resource already exists');

    expect(error.message).toBe('Resource already exists');
  });
});

describe('ValidationError', () => {
  it('should create 422 error with default message', () => {
    const error = new ValidationError();

    expect(error.statusCode).toBe(422);
    expect(error.message).toBe('Validation failed');
  });

  it('should accept errors array', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ];
    const error = new ValidationError('Validation failed', errors);

    expect(error.errors).toEqual(errors);
  });

  it('should default to empty errors array', () => {
    const error = new ValidationError();

    expect(error.errors).toEqual([]);
  });

  it('should allow custom message with errors', () => {
    const errors = [{ field: 'name', message: 'Required' }];
    const error = new ValidationError('Form validation failed', errors);

    expect(error.message).toBe('Form validation failed');
    expect(error.errors).toEqual(errors);
  });
});

describe('Error Hierarchy', () => {
  it('all custom errors should extend AppError', () => {
    expect(new NotFoundError()).toBeInstanceOf(AppError);
    expect(new BadRequestError()).toBeInstanceOf(AppError);
    expect(new UnauthorizedError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
    expect(new ConflictError()).toBeInstanceOf(AppError);
    expect(new ValidationError()).toBeInstanceOf(AppError);
  });

  it('all errors should be operational by default', () => {
    expect(new NotFoundError().isOperational).toBe(true);
    expect(new BadRequestError().isOperational).toBe(true);
    expect(new UnauthorizedError().isOperational).toBe(true);
  });
});
