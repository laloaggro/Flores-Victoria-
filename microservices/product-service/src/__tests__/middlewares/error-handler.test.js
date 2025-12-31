const errorHandler = require('../../middleware/error-handler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle 404 errors', () => {
    const err = new Error('Not found');
    err.statusCode = 404;
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalled();
  });

  it('should handle 500 errors', () => {
    const err = new Error('Server error');
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('should handle validation errors', () => {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
