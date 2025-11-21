const handleWellKnown = require('../../../middleware/wellKnown');

describe('wellKnown Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      path: '',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 404 for .well-known paths', () => {
    req.path = '/.well-known/acme-challenge/test';

    handleWellKnown(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('');
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 for exact .well-known path', () => {
    req.path = '/.well-known';

    handleWellKnown(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next for non-.well-known paths', () => {
    req.path = '/api/products';

    handleWellKnown(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should call next for root path', () => {
    req.path = '/';

    handleWellKnown(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next for paths containing well-known but not starting with it', () => {
    req.path = '/api/.well-known/test';

    handleWellKnown(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should handle empty path', () => {
    req.path = '';

    handleWellKnown(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
