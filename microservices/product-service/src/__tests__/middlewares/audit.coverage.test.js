// Mock winston y logger compartido
jest.mock('winston', () => ({
  transports: {
    Console: jest.fn().mockImplementation(() => ({})),
  },
  format: {
    simple: jest.fn(),
  },
}));

jest.mock('../../shared/logging/logger', () => ({
  add: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('Audit Middleware - Functional Tests', () => {
  let auditLogger;
  let req, res, next;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    auditLogger = require('../../middlewares/audit');
    
    req = {
      method: 'GET',
      url: '/api/products',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    next = jest.fn();
  });

  it('should be a function', () => {
    expect(typeof auditLogger).toBe('function');
  });

  it('should call next()', () => {
    auditLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should log request information', () => {
    const logger = require('../../shared/logging/logger');
    auditLogger(req, res, next);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should extract request method', () => {
    auditLogger(req, res, next);
    expect(req.method).toBe('GET');
  });

  it('should extract request URL', () => {
    auditLogger(req, res, next);
    expect(req.url).toBe('/api/products');
  });

  it('should get user agent', () => {
    auditLogger(req, res, next);
    expect(req.get).toHaveBeenCalledWith('User-Agent');
  });

  it('should handle POST requests', () => {
    req.method = 'POST';
    auditLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should handle different URLs', () => {
    req.url = '/api/products/123';
    auditLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
