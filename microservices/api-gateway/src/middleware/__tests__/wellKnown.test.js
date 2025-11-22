/**
 * Tests for wellKnown middleware
 */

const handleWellKnown = require('../wellKnown');

describe('wellKnown Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      path: '',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should return 404 for .well-known paths', () => {
    mockReq.path = '/.well-known/apple-app-site-association';

    handleWellKnown(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith('');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 404 for any .well-known path', () => {
    mockReq.path = '/.well-known/security.txt';

    handleWellKnown(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith('');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next for non .well-known paths', () => {
    mockReq.path = '/api/products';

    handleWellKnown(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });

  it('should call next for root path', () => {
    mockReq.path = '/';

    handleWellKnown(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should call next for empty path', () => {
    mockReq.path = '';

    handleWellKnown(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
